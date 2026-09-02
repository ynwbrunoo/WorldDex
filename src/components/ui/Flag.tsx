interface FlagProps {
  countryId: string;
  countryName?: string;
  className?: string;
}

export function Flag({
  countryId,
  countryName = "Country",
  className = "",
}: FlagProps) {
  // Use flagcdn for reliable image flags across all OS (especially Windows which lacks native emoji flags).
  const src = `https://flagcdn.com/w80/${countryId.toLowerCase()}.png`;

  return (
    <img
      src={src}
      alt={`Bandeira ${countryName}`}
      className={`block object-cover ${className}`}
      loading="lazy"
    />
  );
}
