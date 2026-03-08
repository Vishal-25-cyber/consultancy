const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
    indigo: 'from-indigo-500 to-indigo-600',
  };

  return (
    <div className="card relative overflow-hidden">
      <div className={`absolute right-0 top-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full -mr-16 -mt-16`}></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          {Icon && (
            <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]} text-white`}>
              <Icon size={20} />
            </div>
          )}
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
        {trend && (
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}%
            </span>
            <span className="text-xs text-gray-500">from last month</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
