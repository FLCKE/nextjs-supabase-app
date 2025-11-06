export default function GeometricBackground() {
  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
      <div className="absolute -top-1/4 -left-1/4 w-150 h-full border-[20px] border-white transform rotate-[-45deg]"></div>
      <div className="absolute -bottom-1/4 -right-1/4 w-150 h-full border-[20px] border-white transform rotate-[-45deg]"></div>
    </div>
  );
}
