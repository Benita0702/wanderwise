import { useEffect, useState } from "react";
import api from "../api";

import { HeroSection } from "../components/home/HeroSection";
import { SpecialOffers } from "../components/home/SpecialOffers";
import { TravelStories } from "../components/home/TravelStories";
import { Testimonials } from "../components/home/Testimonials";
import  ChatbotButton  from "../components/home/ChatbotButton";
import { BudgetOptimizerFloating } from "../components/home/BudgetOptimizerFloating";
import renderRichText from "../utils/renderRichText";

export default function HomePage() {
  const [offers, setOffers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const offerRes = await api.get("/offers?populate=Image");
        setOffers(offerRes.data.data || []);

        const blogRes = await api.get("/blogs?populate=Image");
        setBlogs(blogRes.data.data || []);

        const testRes = await api.get("/testimonials?populate=Photo");
        setTestimonials(testRes.data.data || []);
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      }
    }
    fetchData();
  }, []);

  // ✅ Helper to render Rich Text
  // const renderRichText = (blocks) =>
  //   blocks?.map((block, i) =>
  //     block.children?.map((child, j) => (
  //       <span key={`${i}-${j}`}>{child.text}</span>
  //     ))
  //   );

  return (
    <div>
      <HeroSection />
      <SpecialOffers offers={offers} renderRichText={renderRichText} />
      <TravelStories blogs={blogs} renderRichText={renderRichText} />
      <Testimonials testimonials={testimonials} renderRichText={renderRichText} />
      <BudgetOptimizerFloating />
      <ChatbotButton />
    </div>
  );
}
