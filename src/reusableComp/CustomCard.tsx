export const CustomCard = (props: {
  title?: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
    <h2 className="text-2xl font-bold mb-2">{props.title}</h2>
    <div className="text-gray-700 text-base">{props.children}</div>
  </div>
);
