
const ReusableTable = ({ columns, data, rowKey = '_id', renderEmpty = null }) => {
    if (!data || data.length === 0) {
        return renderEmpty || (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                <p>No data found to display.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={column.key || index} 
                                className={`px-6 py-3 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider ${column.headerClassName || ''}`}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                   
                    {data.map((item) => (
                        <tr key={item[rowKey]} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                     
                            {columns.map((column, index) => (
                                <td
                                    key={`${item[rowKey]}-${column.key || index}`} 
                                    className={`px-6 py-4 whitespace-nowrap text-sm ${column.dataClassName || 'text-gray-700 dark:text-gray-300'} ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}`}
                                >
                                    {column.render ? column.render(item) : (item[column.key] || 'N/A')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReusableTable;