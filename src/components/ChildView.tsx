import HomeView from "./HomeView";

export default function ChildView() {
  return (
    <div className="w-full h-full flex flex-col">
      <HomeView />
    </div>
  );
}