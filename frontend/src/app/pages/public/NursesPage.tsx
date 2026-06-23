import { useEffect, useState } from "react";
import {
  GraduationCap,
  CalendarDays,
  Star,
  MapPin,
  Heart,
  Eye,
  Clock,
} from "lucide-react";
import { BookingModal } from "../../components/booking/BookingModal";
import { Link } from "react-router";
import {
  fetchApprovedSpecialists,
  type SpecialistCard,
} from "../../../utils/specialistMapper";
import { showError } from "../../../utils/toast";

const NURSE_CATEGORIES = [
  "All",
  "Home Care",
  "Pediatric",
  "Geriatric",
  "Wound Care",
  "IV Therapy",
  "Post-Op Care",
];

export function Nurses() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedNurse, setSelectedNurse] = useState<SpecialistCard | null>(
    null,
  );

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [nurses, setNurses] = useState<SpecialistCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedSpecialists("nurse", {
      page: 1,
      limit: 100,
    })
      .then(({ specialists }) => setNurses(specialists))
      .catch((err: Error) => {
        setNurses([]);
        showError(
          err.message || "Unable to load nurses. Please try again later.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredNurses =
    selectedSpecialty === "All"
      ? nurses
      : nurses.filter((nurse) => nurse.specialty === selectedSpecialty);

  const handleBookNurse = (nurse: SpecialistCard) => {
    setSelectedNurse(nurse);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="flex flex-col">
      <section className="relative bg-linear-to-br from-primary/10 to-accent/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-6">
            <Heart className="w-8 h-8 text-pink-600" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our Professional Nurses
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Compassionate and skilled nurses ready to provide quality home
            healthcare services tailored to your needs.
          </p>
        </div>
      </section>

      <section className="py-8 bg-white border-b border-border sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {NURSE_CATEGORIES.map((specialty) => (
              <button
                key={specialty}
                onClick={() => setSelectedSpecialty(specialty)}
                className={`px-6 py-2.5 rounded-lg transition-all ${
                  selectedSpecialty === specialty
                    ? "bg-primary text-white shadow-md"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">
                Loading approved nurses...
              </p>
            </div>
          ) : filteredNurses.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">
                No approved nurses found.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNurses.map((nurse) => (
                <div
                  key={nurse.id}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow flex flex-col"
                >
                  <div className="relative h-55">
                    <img
                      src={nurse.image}
                      alt={nurse.name}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />

                      <span className="font-semibold text-foreground">
                        {nurse.rating}
                      </span>

                      <span className="text-sm text-muted-foreground">
                        ({nurse.reviews})
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 min-h-[400px]">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {nurse.name}
                      </h3>

                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {nurse.specialty}
                      </span>
                    </div>

                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {nurse.description}
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm">
                        <GraduationCap className="w-5 h-5 text-primary shrink-0" />
                        <span>{nurse.education}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-5 h-5 text-primary shrink-0" />
                        <span>{nurse.experience}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-5 h-5 text-primary shrink-0" />
                        <span>{nurse.location}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <CalendarDays className="w-5 h-5 text-primary shrink-0" />
                        <span>Available: {nurse.availability}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <Link
                        to={`/nurse/${nurse.id}`}
                        className="flex items-center justify-center gap-2 bg-transparent text-primary border-2 border-primary font-bold px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>

                      <button
                        onClick={() => handleBookNurse(nurse)}
                        className="bg-primary text-white border-2 border-primary font-bold px-4 py-2 rounded-xl hover:bg-transparent hover:text-primary transition"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedNurse(null);
        }}
        provider={selectedNurse ?? undefined}
        serviceType="nurse"
      />
    </div>
  );
}
