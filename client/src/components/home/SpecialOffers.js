import { STRAPI_URL } from "../../api";

export function SpecialOffers({ offers, renderRichText }) {
  return (
    <section className="py-12 px-8 bg-gradient-to-r from-pink-50 to-yellow-50">
      <h2 className="text-3xl font-bold text-center mb-8">Special Offers</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="bg-white p-6 rounded-xl shadow text-center hover:shadow-md"
          >
            <h3 className="font-semibold text-lg">{offer.Title}</h3>
            {offer.Image?.data && (
              <img
                src={`${STRAPI_URL}${offer.Image.data.attributes.url}`}
                alt={offer.Title}
                className="h-32 w-full object-cover rounded-md my-3"
              />
            )}
            <p className="text-sm text-gray-600">
              {renderRichText(offer.Description)}
            </p>
            <p className="mt-2 text-red-600 font-bold">
              Save {offer.Discount}%!
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
