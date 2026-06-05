import { useState } from "react";
import { Award, Calendar, Star, MapPin, Heart, Phone, Eye } from "lucide-react";
import { BookingModal } from "../../components/booking/BookingModal";
import { Link } from "react-router";

interface Nurse {
  id: number;
  name: string;
  specialty: string;
  image: string;
  certification: string;
  experience: string;
  rating: number;
  reviews: number;
  location: string;
  availability: string;
  description: string;
  services: string[];
}

export function Nurses() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const specialties = [
    "All",
    "Home Care",
    "Pediatric",
    "Geriatric",
    "Wound Care",
    "IV Therapy",
    "Post-Op Care",
  ];

  const nurses = [
    {
      id: 1,
      name: "Emily Johnson",
      specialty: "Home Care",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudXJzZSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3Nzc3Mjc2OTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      certification: "RN, BSN",
      experience: "12 years",
      rating: 4.9,
      reviews: 187,
      location: "Brooklyn, NY",
      availability: "Mon - Sat",
      description: "Experienced home care nurse specializing in chronic disease management and elderly care.",
      services: ["Vital Signs Monitoring", "Medication Administration", "Wound Care"],
    },
    {
      id: 2,
      name: "Maria Rodriguez",
      specialty: "Pediatric",
      image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXNwYW5pYyUyMGZlbWFsZSUyMG51cnNlfGVufDF8fHx8MTc3NzcyNzY5OXww&ixlib=rb-4.1.0&q=80&w=1080",
      certification: "RN, Pediatric Specialist",
      experience: "8 years",
      rating: 5.0,
      reviews: 142,
      location: "Manhattan, NY",
      availability: "Mon - Fri",
      description: "Dedicated pediatric nurse providing compassionate care for children of all ages.",
      services: ["Pediatric Assessment", "Immunizations", "Health Education"],
    },
    {
      id: 3,
      name: "Jennifer Lee",
      specialty: "Geriatric",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGZlbWFsZSUyMG51cnNlfGVufDF8fHx8MTc3NzcyNzY5OXww&ixlib=rb-4.1.0&q=80&w=1080",
      certification: "RN, Gerontology Certified",
      experience: "15 years",
      rating: 4.8,
      reviews: 203,
      location: "Queens, NY",
      availability: "Tue - Sun",
      description: "Specialized in geriatric care with focus on dignity and quality of life for seniors.",
      services: ["Elder Care", "Memory Care", "Fall Prevention"],
    },
    {
      id: 4,
      name: "Sarah Thompson",
      specialty: "Wound Care",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGZlbWFsZSUyMG51cnNlfGVufDF8fHx8MTc3NzcyNzY5OXww&ixlib=rb-4.1.0&q=80&w=1080",
      certification: "RN, CWOCN",
      experience: "10 years",
      rating: 4.9,
      reviews: 156,
      location: "Bronx, NY",
      availability: "Mon, Wed, Fri",
      description: "Expert wound care specialist with advanced training in complex wound management.",
      services: ["Wound Assessment", "Dressing Changes", "Post-Surgical Care"],
    },
    {
      id: 5,
      name: "Amanda White",
      specialty: "IV Therapy",
      image: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudXJzZSUyMHByb2Zlc3Npb25hbCUyMHdoaXRlfGVufDF8fHx8MTc3NzcyNzY5OXww&ixlib=rb-4.1.0&q=80&w=1080",
      certification: "RN, IV Certified",
      experience: "7 years",
      rating: 4.8,
      reviews: 128,
      location: "Staten Island, NY",
      availability: "Tue - Sat",
      description: "Skilled in IV therapy, hydration treatments, and medication administration.",
      services: ["IV Insertion", "Hydration Therapy", "Medication Infusion"],
    },
    {
      id: 6,
      name: "Rachel Brown",
      specialty: "Post-Op Care",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudXJzZSUyMHByb2Zlc3Npb25hbCUyMGZlbWFsZXxlbnwxfHx8fDE3Nzc3Mjc2OTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      certification: "RN, Post-Acute Care",
      experience: "11 years",
      rating: 4.9,
      reviews: 174,
      location: "Manhattan, NY",
      availability: "Mon - Sun",
      description: "Specialized in post-operative recovery and rehabilitation support at home.",
      services: ["Post-Op Monitoring", "Drain Management", "Recovery Support"],
    },
  ];

  const filteredNurses =
    selectedSpecialty === "All"
      ? nurses
      : nurses.filter((nurse) => nurse.specialty === selectedSpecialty);

  const handleBookNurse = (nurse: any) => {
    setSelectedNurse(nurse);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
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

      {/* Nurses Grid */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredNurses.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">
                No nurses found in this specialty.
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

                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {nurse.name}
                      </h3>
                      <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                        {nurse.specialty}
                      </span>
                    </div>

                    <p className="text-muted-foreground mb-6">
                      {nurse.description}
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-3 text-sm">
                        <Award className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-foreground">{nurse.certification}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <Award className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-foreground">
                          {nurse.experience} of experience
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <MapPin className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-foreground">{nurse.location}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <Calendar className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-foreground">
                          Available: {nurse.availability}
                        </span>
                      </div>
                    </div>

                    {/* Services */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-foreground mb-2">Services:</h4>
                      <div className="flex flex-wrap gap-2">
                        {nurse.services.map((service, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-muted text-xs text-foreground rounded"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        to={`/provider/nurse/${nurse.id}`}
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

      {/* CTA Section */}
      <section className="py-20 bg-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-12 h-12 mx-auto mb-6 text-pink-300" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Need Home Healthcare?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Our dedicated nurses are here to provide quality care in the comfort of your home. Request a service today.
          </p>
          <a
            href="tel:+1234567890"
            className="inline-flex items-center space-x-2 bg-primary text-white px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors text-lg font-medium"
          >
            <Phone className="w-5 h-5" />
            <span>Call Us Now</span>
          </a>
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedNurse(null);
        }}
        provider={selectedNurse?? undefined}
        serviceType="nurse"
      />
    </div>
  );
}
