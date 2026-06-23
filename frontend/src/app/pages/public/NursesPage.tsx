import { useEffect, useState } from "react";
import { Award, Calendar, Star, MapPin, Heart, Phone, Eye } from "lucide-react";
import { BookingModal } from "../../components/booking/BookingModal";
import { Link } from "react-router";
import { fetchApprovedSpecialists, type SpecialistCard } from "../../../utils/specialistMapper";
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
  const [selectedNurse, setSelectedNurse] = useState<SpecialistCard | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [nurses, setNurses] = useState<SpecialistCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedSpecialists("nurse", 100)
      .then(setNurses)
      .catch(() => {
        setNurses([]);
        showError("Unable to load nurses. Please try again later.");
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
            Compassionate and skilled nurses ready to provide quality home healthcare services tailored to your needs.
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
              <p className="text-lg text-muted-foreground">Loading approved nurses...</p>
            </div>
          ) : filteredNurses.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">
                No approved nurses found in this category yet.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNurses.map((nurse) => (
                <div
                  key={nurse.id}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
                >
                  <div className="relative h-80">
                    <img src={nurse.image} alt={nurse.name} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-semibold text-foreground">{nurse.rating}</span>
                      <span className="text-sm text-muted-foreground">({nurse.reviews})</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-foreground mb-2">{nurse.name}</h3>
                      <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                        {nurse.specialty}
                      </span>
                    </div>

                    <p className="text-muted-foreground mb-6">{nurse.description}</p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-3 text-sm">
                        <Award className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-foreground">{nurse.education}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <Award className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-foreground">{nurse.experience}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <MapPin className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-foreground">{nurse.location}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <Calendar className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-foreground">Available: {nurse.availability}</span>
                      </div>
                    </div>

                    {nurse.services && nurse.services.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-foreground mb-2">Service Areas:</h4>
                        <div className="flex flex-wrap gap-2">
                          {nurse.services.map((service) => (
                            <span
                              key={service}
                              className="px-2 py-1 bg-muted text-xs text-foreground rounded"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        to={`/nurse/${nurse.id}`}
                        className="flex items-center justify-center space-x-2 border-2 border-primary text-primary py-3 rounded-lg hover:bg-primary/5 transition-colors font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </Link>
                      <button
                        onClick={() => handleBookNurse(nurse)}
                        className="bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
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

      {/* <section className="py-20 bg-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-12 h-12 mx-auto mb-6 text-pink-300" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Need Home Healthcare?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Our dedicated nurses are here to provide quality care in the comfort of your home. Request a service today.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center space-x-2 bg-primary text-white px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors text-lg font-medium"
          >
            <Phone className="w-5 h-5" />
            <span>Contact Us</span>
          </Link>
        </div>
      </section> */}

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
