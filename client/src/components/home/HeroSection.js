import { useNavigate } from "react-router-dom";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section
      className="h-screen bg-cover bg-center flex flex-col items-center justify-center text-white text-center relative"
      style={{ backgroundImage: "url('/images/homepic2.jpeg')" }}
    >
      {/* Overlay for dark effect */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl">
        <h1 className="text-5xl font-bold mb-4 leading-snug">
          Travel Far, <br /> Find Yourself
        </h1>
        <p className="mb-6 text-lg">
          Embark on the journey of a lifetime with unforgettable experiences.
        </p>
        <div className="flex justify-center space-x-4 mb-10">
          <button
            className="px-6 py-3 bg-yellow-500 rounded-lg hover:bg-yellow-600"
            onClick={() => navigate("/planner")}
          >
            Start Your Adventure
          </button>
          <button
            className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700"
            onClick={() => navigate("/packages")}
          >
            View Packages
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 flex space-x-16 mt-10 text-center">
        <div>
          <h2 className="text-3xl font-bold text-orange-400">50K+</h2>
          <p className="text-lg">Happy Travelers</p>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-orange-400">1000+</h2>
          <p className="text-lg">Destinations</p>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-orange-400">4.6</h2>
          <p className="text-lg">Average Rating</p>
        </div>
      </div>
    </section>
  );
}
