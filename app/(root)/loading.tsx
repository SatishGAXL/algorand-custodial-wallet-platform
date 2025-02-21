export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div
      style={{ height: "80vh" }}
      className=" w-full bg-white flex justify-center items-center text-white"
    >
      <span className="loader"></span>
    </div>
  );
}
