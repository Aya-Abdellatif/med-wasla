import { useParams, useNavigate } from "react-router";
import {
  Award,
  Star,
  MapPin,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  DollarSign,
  Watch,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BookingModal } from "../../components/booking/BookingModal";
import {
  fetchSpecialistProfile,
  fetchSpecialistReviews,
  type ReviewItem,
  type SpecialistProfile,
} from "../../../utils/specialistMapper";

export function DoctorProfile() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Invalid doctor profile.</p>
      </div>
    );
  }

  return <DoctorProfileView key={id} id={id} />;
}

function DoctorProfileView({ id }: { id: string }) {
  const navigate = useNavigate();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [doctor, setDoctor] = useState<SpecialistProfile | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const REVIEWS_PER_PAGE = 3;

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchSpecialistProfile(id, "doctor"), fetchSpecialistReviews(id)])
      .then(([profile, profileReviews]) => {
        if (cancelled) return;
        setDoctor(profile);
        setReviews(profileReviews);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setDoctor(null);
        setError(err instanceof Error ? err.message : "Failed to load doctor profile");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const hasReviews = reviews.length > 0;
  const totalPages = Math.max(Math.ceil(reviews.length / REVIEWS_PER_PAGE), 1);
  const prev = () => setCurrentPage((p) => (p === 0 ? totalPages - 1 : p - 1));
  const next = () => setCurrentPage((p) => (p === totalPages - 1 ? 0 : p + 1));
  const startIndex = currentPage * REVIEWS_PER_PAGE;
  const displayedReviews = reviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading doctor profile...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg rounded-[32px] border border-border bg-white p-10 text-center shadow-xl shadow-muted/20">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Doctor Not Found</h2>
          <p className="text-base leading-7 text-muted-foreground mb-8">
            {error ?? "Please return to the doctors page and choose another profile."}
          </p>
          <button
            onClick={() => navigate("/doctors")}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white shadow-xl shadow-primary/20 transition-all duration-200 hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Doctors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/doctors")}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white shadow-xl shadow-primary/20 transition-all duration-200 hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Doctors
          </button>
        </div>
      </div>

      <section className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-1">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img src={doctor.image} alt={doctor.name} className="w-full aspect-square object-cover" />
                <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-semibold text-foreground">{doctor.rating}</span>
                  <span className="text-sm text-muted-foreground">({doctor.reviews})</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-4">
              <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">{doctor.name}</h1>
                  <span className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-full font-medium">
                    <Award className="w-4 h-4" />
                    <span>{doctor.specialty}</span>
                  </span>
                </div>
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full md:w-auto px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg"
                >
                  Book Appointment
                </button>
              </div>
              <p className="text-lg text-muted-foreground mb-6">{doctor.description}</p>
            </div>

            <div className="md:col-span-5 md:row-start-2 md:col-start-1">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                  <Award className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-semibold text-foreground">{doctor.experience}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold text-foreground">{doctor.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Consultation Fee</p>
                    <p className="font-semibold text-foreground">{doctor.consultationFee} EGP</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Education</p>
                    <p className="font-semibold text-foreground">{doctor.education}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                  <Clock className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Availability</p>
                    <p className="font-semibold text-foreground">{doctor.availability}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                  <Watch className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Average Wait Time</p>
                    <p className="font-semibold text-foreground">{doctor.avgWaitTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div className="text-left mb-12">
                <h2 className="text-4xl font-black text-fg mb-3">Patient Reviews</h2>
                <p className="text-fg-muted">
                  Hear what our patients have to say about their experiences with {doctor.name}.
                </p>
              </div>
              <div className="w-full">
                {hasReviews ? (
                  <>
                    <div className="flex flex-col gap-6">
                      {displayedReviews.map((rev, idx) => (
                        <div key={startIndex + idx} className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                          <div className="flex gap-1 mb-3">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                          <p className="text-fg leading-relaxed text-base mb-4">"{rev.text}"</p>
                          <div className="flex items-center gap-3">
                            <img src={rev.img} alt={rev.name} className="h-10 w-10 rounded-full object-cover border-2 border-primary/20" />
                            <div>
                              <p className="font-bold text-fg">{rev.name}</p>
                              <p className="text-sm text-fg-muted">{rev.role}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-6">
                      <button onClick={prev} className="h-9 w-9 rounded-full border-2 border-border hover:border-primary hover:text-primary flex items-center justify-center transition-all duration-200 cursor-pointer">
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={
                            "h-2.5 rounded-full transition-all duration-300 cursor-pointer " +
                            (i === currentPage ? "w-6 bg-primary" : "w-2.5 bg-border hover:bg-primary/40")
                          }
                        />
                      ))}
                      <button onClick={next} className="h-9 w-9 rounded-full border-2 border-border hover:border-primary hover:text-primary flex items-center justify-center transition-all duration-200 cursor-pointer">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="bg-white border border-border rounded-2xl p-8 text-center shadow-sm">
                    <p className="text-fg">No reviews available at the moment.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-1 space-y-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Certifications</h2>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="grid gap-3">
                  {doctor.certifications.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                      <Award className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        provider={doctor}
        serviceType="doctor"
      />
    </div>
  );
}
