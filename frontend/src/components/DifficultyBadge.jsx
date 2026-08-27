export default function DifficultyBadge({
  difficulty,
}) {
  const value =
    difficulty || "Unknown";

  return (
    <span
      className={`difficulty ${value.toLowerCase()}`}
    >
      {value}
    </span>
  );
}