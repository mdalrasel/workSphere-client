
const ReusableCard = ({ data, renderItem, rowKey }) => { 
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-600 dark:text-gray-400">No data found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((item) => (
        <div key={item[rowKey]} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-600">
          {renderItem(item)} 
        </div>
      ))}
    </div>
  );
};

export default ReusableCard;