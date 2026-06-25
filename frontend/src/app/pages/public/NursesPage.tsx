import { Link } from "react-router";
import {
  GraduationCap,
  CalendarDays,
  Star,
  MapPin,
  SearchCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { BookingModal } from "../../components/booking/BookingModal";
import { NURSE_EXPERTISE_AREAS } from "../../../constants/medicalSpecializations";
import {
  fetchApprovedSpecialists,
  type SpecialistCard,
  type PaginationMeta,
} from "../../../utils/specialistMapper";
import { showError } from "../../../utils/toast";

const SORT_OPTIONS = [
  { label: "Highest Rated", sortBy: "rating", sortOrder: "desc" as const },
  { label: "Newest", sortBy: "createdAt", sortOrder: "desc" as const },
  { label: "Most Reviewed", sortBy: "reviewCount", sortOrder: "desc" as const },
  {
    label: "Fee: Low to High",
    sortBy: "consultationFee",
    sortOrder: "asc" as const,
  },
  {
    label: "Fee: High to Low",
    sortBy: "consultationFee",
    sortOrder: "desc" as const,
  },
] as const;

export function Nurses() {
  const [selectedExpertise, setSelectedExpertise] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortIndex, setSortIndex] = useState(0);
  const [page, setPage] = useState(1);

  const [selectedNurse, setSelectedNurse] = useState<SpecialistCard | null>(
    null,
  );
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [nurses, setNurses] = useState<SpecialistCard[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const resultsRef = useRef<HTMLDivElement>(null);

  // debounce search input -> debouncedSearch (waits 400ms after typing stops)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const { sortBy, sortOrder } = SORT_OPTIONS[sortIndex];

    fetchApprovedSpecialists("nurse", {
      search: debouncedSearch || undefined,
      expertise: selectedExpertise === "All" ? undefined : selectedExpertise,
      sortBy,
      sortOrder,
      page,
      limit: 9,
    })
      .then(({ specialists, pagination }) => {
        setNurses(specialists);
        setPagination(pagination);
      })
      .catch((err: Error) => {
        setNurses([]);
        setPagination(null);
        showError(
          err.message || "Unable to load nurses. Please try again later.",
        );
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch, selectedExpertise, sortIndex, page]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    resultsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [page]);

  const expertiseAreas = ["All", ...NURSE_EXPERTISE_AREAS];

  const handleBookNurse = (nurse: SpecialistCard) => {
    setSelectedNurse(nurse);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="flex flex-col">
      <section className="relative bg-linear-to-br from-[#F6FFFB] via-[#ECFEFF] to-[#F0FDFA] py-20 px-5 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <SearchCheck
                strokeWidth={2.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                  setLoading(true);
                }}
                placeholder="Search by name, bio, or area of expertise..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/80"
              />
            </div>

            <div className="relative">
              <select
                value={sortIndex}
                onChange={(e) => {
                  setSortIndex(Number(e.target.value));
                  setPage(1);
                  setLoading(true);
                }}
                className="appearance-none px-4 py-2.5 pr-10 rounded-2xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/80"
              >
                {SORT_OPTIONS.map((opt, idx) => (
                  <option key={opt.label} value={idx}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-primary"
                size={18}
                strokeWidth={2.5}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            {expertiseAreas.map((area) => (
              <button
                key={area}
                onClick={() => {
                  setSelectedExpertise(area);
                  setPage(1);
                  setLoading(true);
                }}
                className={`px-6 py-2.5 rounded-lg transition-all ${
                  selectedExpertise === area
                    ? "bg-primary text-white shadow-md"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section ref={resultsRef} className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">
                Loading approved nurses...
              </p>
            </div>
          ) : nurses.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-fg">
                No approved nurses found matching your filters.
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {nurses.map((nurse) => (
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
                          {(nurse.rating ?? 0).toFixed(1)}
                        </span>

                        <span className="text-sm text-muted-foreground">
                          ({nurse.reviews})
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1 min-h-[350px]">
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

                        {/* Service areas row replaces the old location row —
                            nurses cover areas for home visits, they don't
                            have a single clinic address. */}
                        <div className="flex items-start gap-3 text-sm">
                          <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span>
                            {nurse.serviceAreas && nurse.serviceAreas.length > 0
                              ? nurse.serviceAreas.join(", ")
                              : "Service areas not listed"}
                          </span>
                        </div>

                        <div className="flex items-start gap-3 text-sm">
                          <CalendarDays className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span>Available: {nurse.availability}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-auto">
                        <Link
                          to={`/nurse/${nurse.id}`}
                          className="group flex items-center justify-center gap-2 bg-transparent text-primary border-2 border-primary font-bold text-base px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:shadow-md whitespace-nowrap"
                        >
                          View Details
                        </Link>

                        <button
                          onClick={() => handleBookNurse(nurse)}
                          className="group flex items-center justify-center gap-2 bg-primary text-white border-2 border-primary font-bold text-base px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-md whitespace-nowrap"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={loading || page === 1}
                    className="p-2 rounded-lg border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1,
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-4 py-2 rounded-lg ${
                        p === page
                          ? "bg-primary text-white"
                          : "bg-white border border-border hover:bg-muted"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                    disabled={loading || page === pagination.totalPages}
                    className="p-2 rounded-lg border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
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
