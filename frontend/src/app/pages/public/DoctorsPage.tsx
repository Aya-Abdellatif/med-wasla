import { Link } from "react-router";
import { Award, GraduationCap, Calendar, Star, MapPin, Eye } from "lucide-react";
import { useState } from "react";
import { BookingModal } from "../../components/booking/BookingModal";

export function Doctors() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const specialties = [
    "All",
    "Cardiology",
    "Emergency Care",
    "Pediatrics",
    "Neurology",
    "Orthopedics",
    "Primary Care",
  ];

  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Williams",
      specialty: "Cardiology",
      image: "https://images.unsplash.com/photo-1632054224477-c9cb3aae1b7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBkb2N0b3IlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzc3NzI3Njk4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      education: "MD, Harvard Medical School",
      experience: "15 years",
      rating: 4.9,
      reviews: 234,
      location: "Building A, Floor 3",
      availability: "Mon, Wed, Fri",
      description: "Specializes in interventional cardiology and heart disease prevention with extensive experience in complex cardiac procedures.",
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Neurology",
      image: "https://images.unsplash.com/photo-1575654402720-0af3480d1fad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwZG9jdG9yJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3NzcwOTY1Nnww&ixlib=rb-4.1.0&q=80&w=1080",
      education: "MD, PhD, Johns Hopkins University",
      experience: "12 years",
      rating: 4.8,
      reviews: 189,
      location: "Building B, Floor 2",
      availability: "Tue, Thu, Sat",
      description: "Expert in treating neurological disorders, stroke management, and neurodegenerative diseases.",
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      specialty: "Pediatrics",
      image: "https://images.unsplash.com/photo-1623854767648-e7bb8009f0db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXNwYW5pYyUyMGZlbWFsZSUyMGRvY3RvcnxlbnwxfHx8fDE3Nzc3Mjc2OTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      education: "MD, Stanford University",
      experience: "10 years",
      rating: 5.0,
      reviews: 312,
      location: "Building C, Floor 1",
      availability: "Mon - Fri",
      description: "Dedicated to providing compassionate care for children from newborns to adolescents.",
    },
    {
      id: 4,
      name: "Dr. James Thompson",
      specialty: "Orthopedics",
      image: "https://images.unsplash.com/photo-1625134673337-519d4d10b313?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMG1hbGUlMjBkb2N0b3J8ZW58MXx8fHwxNzc3NzI3Njk5fDA&ixlib=rb-4.1.0&q=80&w=1080",
      education: "MD, Yale School of Medicine",
      experience: "18 years",
      rating: 4.9,
      reviews: 267,
      location: "Building A, Floor 2",
      availability: "Mon, Wed, Thu",
      description: "Specializes in sports medicine, joint replacement, and minimally invasive orthopedic surgery.",
    },
    {
      id: 5,
      name: "Dr. Lisa Park",
      specialty: "Primary Care",
      image: "https://images.unsplash.com/photo-1576669802218-d535933f897c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGZlbWFsZSUyMGRvY3RvcnxlbnwxfHx8fDE3Nzc3Mjc2OTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      education: "MD, Columbia University",
      experience: "8 years",
      rating: 4.8,
      reviews: 198,
      location: "Building C, Floor 3",
      availability: "Tue - Sat",
      description: "Focuses on preventive care, chronic disease management, and overall wellness.",
    },
    {
      id: 6,
      name: "Dr. Robert Anderson",
      specialty: "Emergency Care",
      image: "https://images.unsplash.com/photo-1758691461513-88a0aef72160?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW5pb3IlMjBtYWxlJTIwZG9jdG9yfGVufDF8fHx8MTc3NzcyNzY5OXww&ixlib=rb-4.1.0&q=80&w=1080",
      education: "MD, University of Pennsylvania",
      experience: "22 years",
      rating: 4.9,
      reviews: 421,
      location: "Emergency Department",
      availability: "24/7 On-Call",
      description: "Veteran emergency physician with expertise in trauma care and critical emergency situations.",
    },
  ];

  const filteredDoctors =
    selectedSpecialty === "All"
      ? doctors
      : doctors.filter((doctor) => doctor.specialty === selectedSpecialty);

  const handleBookDoctor = (doctor: any) => {
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
          {filteredDoctors.length === 0 ? (
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
                        to={`/provider/doctor/${doctor.id}`}
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
        provider={selectedDoctor}
        serviceType="doctor"
      />
    </div>
  );
}