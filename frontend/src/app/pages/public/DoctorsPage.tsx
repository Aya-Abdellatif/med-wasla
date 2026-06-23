import { Link } from "react-router";
import { Award, GraduationCap, Calendar, Star, MapPin, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { BookingModal } from "../../components/booking/BookingModal";
import { MEDICAL_SPECIALIZATIONS } from "../../../constants/medicalSpecializations";
import { fetchApprovedSpecialists, type SpecialistCard } from "../../../utils/specialistMapper";
import { showError } from "../../../utils/toast";

export function Doctors() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState<SpecialistCard | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [doctors, setDoctors] = useState<SpecialistCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedSpecialists("doctor", 100)
      .then(setDoctors)
      .catch(() => {
        setDoctors([]);
        showError("Unable to load doctors. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  const specialties = ["All", ...MEDICAL_SPECIALIZATIONS];

  const filteredDoctors =
    selectedSpecialty === "All"
      ? doctors
      : doctors.filter((doctor) => doctor.specialty === selectedSpecialty);

  const handleBookDoctor = (doctor: SpecialistCard) => {
    setSelectedDoctor(doctor);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="flex flex-col">
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

      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">Loading approved doctors...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">
                No approved doctors found in this specialty yet.
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
                      <span className="font-semibold text-foreground">{doctor.rating}</span>
                      <span className="text-sm text-muted-foreground">({doctor.reviews})</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-foreground mb-2">{doctor.name}</h3>
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {doctor.specialty}
                      </span>
                    </div>

                    <p className="text-muted-foreground mb-6">{doctor.description}</p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-3 text-sm">
                        <GraduationCap className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-foreground">{doctor.education}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <Award className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-foreground">{doctor.experience}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <MapPin className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-foreground">{doctor.location}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <Calendar className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-foreground">Available: {doctor.availability}</span>
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

      {/* <section className="py-20 bg-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Schedule Your Visit?</h2>
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
      </section> */}

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
