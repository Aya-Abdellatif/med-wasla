import { Link } from "react-router";
import { Award, GraduationCap, Calendar, Star, MapPin, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { BookingModal } from "../../components/booking/BookingModal";
import { API_BASE } from "../../../services/api";
import { getFirstName } from "../../../utils/displayName";
import { showError } from "../../../utils/toast";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  education: string;
  experience: string;
  rating: number;
  reviews: number;
  location: string;
  availability: string;
  description: string;
}

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1632054224477-c9cb3aae1b7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBkb2N0b3IlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzc3NzI3Njk4fDA&ixlib=rb-4.1.0&q=80&w=1080";

export function Doctors() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/specialists?verificationStatus=approved&specialistType=doctor&limit=50`,
        );
        const json = await res.json();

        if (json.success) {
          const mapped: Doctor[] = json.data.specialists.map((s: any) => ({
            id: s._id,
            name: getFirstName(s.userId?.name) || "Doctor",
            specialty: s.specialization ?? "General Medicine",
            image: s.userId?.photoUrl || DEFAULT_IMAGE,
            education: s.certifications?.[0]?.title ?? "Medical Degree",
            experience: s.avgWaitMinutes ? `${s.avgWaitMinutes} min wait` : "Experienced",
            rating: s.rating ?? 0,
            reviews: s.reviewCount ?? 0,
            location: s.clinicAddress ?? s.userId?.address ?? "Cairo",
            availability:
              s.availableSlots?.map((slot: any) => slot.day).join(", ") || "Contact clinic",
            description: s.bio ?? "Experienced medical specialist.",
          }));
          setDoctors(mapped);
        } else {
          showError("Failed to load doctors");
        }
      } catch {
        setDoctors([]);
        showError("Unable to load doctors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const specialties = [
    "All",
    ...Array.from(new Set(doctors.map((doctor) => doctor.specialty).filter(Boolean))),
  ];

  const filteredDoctors =
    selectedSpecialty === "All"
      ? doctors
      : doctors.filter((doctor) => doctor.specialty === selectedSpecialty);

  const handleBookDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-primary/10 to-accent/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Meet Our Expert Doctors
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our team of board-certified physicians brings years of experience and dedication to providing exceptional healthcare.
          </p>
        </div>
      </section>

      {/* Specialty Filter */}
      <section className="py-8 bg-white border-b border-border sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {specialties.map((specialty) => (
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

      {/* Doctors Grid */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">Loading approved doctors...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">
                No doctors found in this specialty.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
                >
                  <div className="relative h-80">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-semibold text-foreground">
                        {doctor.rating}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({doctor.reviews})
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {doctor.name}
                      </h3>
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {doctor.specialty}
                      </span>
                    </div>

                    <p className="text-muted-foreground mb-6">
                      {doctor.description}
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-3 text-sm">
                        <GraduationCap className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-foreground">{doctor.education}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <Award className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-foreground">
                          {doctor.experience} of experience
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <MapPin className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-foreground">{doctor.location}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <Calendar className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-foreground">
                          Available: {doctor.availability}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        to={`/doctor/${doctor.id}`}
                        className="flex items-center justify-center space-x-2 border-2 border-primary text-primary py-3 rounded-lg hover:bg-primary/5 transition-colors font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </Link>
                      <button
                        onClick={() => handleBookDoctor(doctor)}
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

      {/* CTA Section */}
      <section className="py-20 bg-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Schedule Your Visit?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Our dedicated team is here to provide you with the best medical care. Book an appointment with one of our specialists today.
          </p>
          <Link
            to="/appointments"
            className="inline-flex items-center space-x-2 bg-primary text-white px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors text-lg font-medium"
          >
            <Calendar className="w-5 h-5" />
            <span>Book Appointment</span>
          </Link>
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedDoctor(null);
        }}
        provider={selectedDoctor ?? undefined}
        serviceType="doctor"
      />
    </div>
  );
}