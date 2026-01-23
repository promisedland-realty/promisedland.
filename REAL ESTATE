import { useState } from "react";
import properties from "../data/properties.json";
import SearchFilter from "../components/SearchFilter";
import PropertyCard from "../components/PropertyCard";
import ReraInfo from "../components/ReraInfo";

export default function Home() {
  const [filters, setFilters] = useState({});

  const filtered = properties.filter((p) => {
    return (
      (!filters.location ||
        p.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.type || p.type === filters.type) &&
      (!filters.price || p.price <= filters.price)
    );
  });

  return (
    <div className="container">
      <h1>Promised Land</h1>

      <SearchFilter filters={filters} setFilters={setFilters} />

      {filtered.map((p) => (
        <PropertyCard key={p.id} property={p} />
      ))}

      <ReraInfo />
    </div>
  );
}
