/** Kaart met het kantoor in Haarlem (OpenStreetMap-embed, geen extra scripts nodig). */
const LAT = 52.3753749;
const LNG = 4.6268966;

export function ContactMap() {
  const bbox = [LNG - 0.006, LAT - 0.0035, LNG + 0.006, LAT + 0.0035].join(",");
  return (
    <iframe
      title="Kaart: We Shape The Future, Van Eedenstraat 18, Haarlem"
      src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${LAT},${LNG}`}
      loading="lazy"
      style={{
        width: "100%",
        height: "100%",
        minHeight: 280,
        border: 0,
        borderRadius: "inherit",
      }}
    />
  );
}
