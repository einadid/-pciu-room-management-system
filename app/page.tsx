import Link from 'next/link';
import Card from '@/components/ui/Card';

export default function HomePage() {
  const features = [
    {
      title: 'Check Room Availability',
      description: 'Find free rooms instantly by selecting day and time slot',
      href: '/check-room',
      icon: '🔍',
      color: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      title: 'CR Login',
      description: 'Class Representatives can manage their department schedules',
      href: '/login',
      icon: '👤',
      color: 'bg-green-50 hover:bg-green-100',
    },
    {
      title: 'View All Rooms',
      description: 'Browse complete list of rooms with their details',
      href: '/rooms',
      icon: '🏫',
      color: 'bg-purple-50 hover:bg-purple-100',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          PCIU Room Management System
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find available classrooms and labs instantly. 
          Manage schedules efficiently.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">60+</div>
          <div className="text-sm text-gray-500 mt-1">Total Rooms</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">6</div>
          <div className="text-sm text-gray-500 mt-1">Time Slots</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">20+</div>
          <div className="text-sm text-gray-500 mt-1">Lab Rooms</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-600">5</div>
          <div className="text-sm text-gray-500 mt-1">Days/Week</div>
        </Card>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <div className={`${feature.color} rounded-xl p-6 transition-all duration-200 border border-transparent hover:border-gray-200 h-full`}>
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h2>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Current Status */}
      <Card className="mt-12" title="📍 Quick Info">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">University Hours</h4>
            <p className="text-gray-600">Sunday - Thursday</p>
            <p className="text-gray-600">8:30 AM - 6:00 PM</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Time Slots</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Slot 1: 08:30 - 09:55</li>
              <li>Slot 2: 10:00 - 11:25</li>
              <li>Slot 3: 11:30 - 12:55</li>
              <li>Slot 4: 13:30 - 14:55</li>
              <li>Slot 5: 15:00 - 16:25</li>
              <li>Slot 6: 16:30 - 17:55</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}