import {
  ShoppingBagIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

const QuickStats = () => {
  const stats = [
    {
      title: "Today's Orders",
      value: "24",
      change: "+3",
      trend: "up",
      icon: ShoppingBagIcon,
      color: "bg-blue-500",
      changeColor: "text-green-500",
    },
    {
      title: "Today's Revenue",
      value: "$1,890",
      change: "+$240",
      trend: "up",
      icon: CurrencyDollarIcon,
      color: "bg-green-500",
      changeColor: "text-green-500",
    },
    {
      title: "New Customers",
      value: "12",
      change: "-2",
      trend: "down",
      icon: UserGroupIcon,
      color: "bg-purple-500",
      changeColor: "text-red-500",
    },
    {
      title: "Pending Orders",
      value: "8",
      change: "-1",
      trend: "down",
      icon: ShoppingBagIcon,
      color: "bg-orange-500",
      changeColor: "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <div className="flex items-baseline mt-2">
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <div className={`flex items-center ml-3 ${stat.changeColor}`}>
                  {stat.trend === "up" ? (
                    <ArrowUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium ml-1">
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
            <div className={`${stat.color} p-3 rounded-xl`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
