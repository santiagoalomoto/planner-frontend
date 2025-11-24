import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { 
  MapPin, 
  Search, 
  Filter,
  Building2,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  Maximize2,
  Layers
} from 'lucide-react';

export default function RoomMap() {
  const [rooms, setRooms] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [TIMESLOTS, setTimeslots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Cargar datos
  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsRes, schedulesRes, timeslotsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/schedules/rooms'),
        api.get('/timeslots')
      ]);
      
      setRooms(roomsRes.data);
      setSchedules(schedulesRes.data);
      setTimeslots(timeslotsRes.data);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      alert('No se pudieron cargar los datos del mapa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Actualizar hora cada minuto
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Determinar si un aula está ocupada ahora
  const isRoomOccupied = (roomId) => {
    const now = currentTime;
    const currentDay = now.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();

    const currentTimeStr = now.toTimeString().slice(0, 5);

    return schedules.some(schedule => {
      if (schedule.room?.id !== roomId) return false;
      
      const timeslot = schedule.timeslot;
      if (!timeslot) return false;

      // Verificar día y hora
      return timeslot.day_of_week?.toLowerCase() === currentDay &&
             currentTimeStr >= timeslot.start_time &&
             currentTimeStr <= timeslot.end_time;
    });
  };

  // Obtener próximo horario de un aula
  const getNextSchedule = (roomId) => {
    const roomSchedules = schedules.filter(s => s.room?.id === roomId);
    if (roomSchedules.length === 0) return null;

    // Simplificado: retornar el primer horario
    return roomSchedules[0];
  };

  // Ver detalles de un aula
  const viewRoomDetails = (room) => {
    setSelectedRoom(room);
    setShowModal(true);
  };

  // Filtros
  const buildings = [...new Set(rooms.map(r => r.building).filter(Boolean))];
  const floors = [...new Set(rooms.map(r => r.floor).filter(f => f !== null && f !== undefined))].sort();

  const filteredRooms = rooms.filter(room => {
    const matchSearch = room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       room.room_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFloor = selectedFloor === 'all' || room.floor?.toString() === selectedFloor;
    const matchBuilding = selectedBuilding === 'all' || room.building === selectedBuilding;
    
    return matchSearch && matchFloor && matchBuilding;
  });

  // Estado de aula
  const getRoomStatus = (room) => {
    const occupied = isRoomOccupied(room.id);
    return {
      status: occupied ? 'occupied' : 'available',
      label: occupied ? 'Ocupada' : 'Disponible',
      color: occupied ? 'bg-red-500' : 'bg-green-500',
      textColor: occupied ? 'text-red-700' : 'text-green-700',
      bgColor: occupied ? 'bg-red-50' : 'bg-green-50',
      borderColor: occupied ? 'border-red-200' : 'border-green-200'
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
      {/* Header Premium */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
            <MapPin className="text-white" size={20} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Mapeado de Aulas</h1>
        </div>
        <p className="text-slate-600 ml-13">Visualiza la disponibilidad de aulas en tiempo real</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar aula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Building Filter */}
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
          >
            <option value="all">Todos los edificios</option>
            {buildings.map(building => (
              <option key={building} value={building}>{building}</option>
            ))}
          </select>

          {/* Floor Filter */}
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
          >
            <option value="all">Todos los pisos</option>
            {floors.map(floor => (
              <option key={floor} value={floor.toString()}>Piso {floor}</option>
            ))}
          </select>

          {/* Current Time */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 rounded-lg text-slate-700 font-medium">
            <Clock size={18} />
            <span>{currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-5 border border-teal-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-600 text-sm font-medium mb-1">Total Aulas</p>
              <p className="text-3xl font-bold text-teal-700">{filteredRooms.length}</p>
            </div>
            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium mb-1">Disponibles</p>
              <p className="text-3xl font-bold text-green-700">
                {filteredRooms.filter(r => !isRoomOccupied(r.id)).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 border border-red-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium mb-1">Ocupadas</p>
              <p className="text-3xl font-bold text-red-700">
                {filteredRooms.filter(r => isRoomOccupied(r.id)).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <XCircle className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium mb-1">Edificios</p>
              <p className="text-3xl font-bold text-purple-700">{buildings.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <Layers className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Room Grid Map */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 animate-pulse h-48"></div>
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-slate-100">
          <MapPin className="mx-auto text-slate-300 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No hay aulas</h3>
          <p className="text-slate-500">No se encontraron aulas con los filtros seleccionados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredRooms.map((room) => {
            const status = getRoomStatus(room);
            const nextSchedule = getNextSchedule(room.id);
            
            return (
              <div
                key={room.id}
                onClick={() => viewRoomDetails(room)}
                className={`group cursor-pointer bg-white rounded-2xl p-5 shadow-lg border ${status.borderColor} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.bgColor}`}>
                    <div className={`w-2 h-2 rounded-full ${status.color} animate-pulse`}></div>
                    <span className={`text-xs font-bold ${status.textColor}`}>
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Room Info */}
                <div className="mb-3">
                  <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-teal-600 transition-colors">
                    {room.name}
                  </h3>
                  <p className="text-sm text-slate-500">{room.room_type || 'Aula estándar'}</p>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users size={14} className="text-blue-500" />
                    <span className="text-xs">
                      Capacidad: <strong>{room.capacity}</strong>
                    </span>
                  </div>
                  
                  {room.building && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building2 size={14} className="text-purple-500" />
                      <span className="text-xs">
                        {room.building} - Piso {room.floor || 'N/A'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Next Schedule */}
                {nextSchedule && (
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-start gap-2 text-xs text-slate-600">
                      <Clock size={12} className="text-orange-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Próxima clase:</p>
                        <p className="text-slate-500">
                          {nextSchedule.section?.offering?.course?.name || 'Sin info'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* View Details Button */}
                <button className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-lg font-medium text-sm transition-all">
                  <Info size={14} />
                  Ver detalles
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalles */}
      <Modal 
        open={showModal} 
        title={`Detalles de ${selectedRoom?.name || 'Aula'}`}
        onClose={() => setShowModal(false)}
      >
        {selectedRoom && (
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getRoomStatus(selectedRoom).bgColor}`}>
                <div className={`w-3 h-3 rounded-full ${getRoomStatus(selectedRoom).color} animate-pulse`}></div>
                <span className={`font-bold ${getRoomStatus(selectedRoom).textColor}`}>
                  {getRoomStatus(selectedRoom).label}
                </span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Tipo de Aula</p>
                <p className="font-semibold text-slate-800">{selectedRoom.room_type || 'Estándar'}</p>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Capacidad</p>
                <p className="font-semibold text-slate-800">{selectedRoom.capacity} estudiantes</p>
              </div>
              
              {selectedRoom.building && (
                <>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Edificio</p>
                    <p className="font-semibold text-slate-800">{selectedRoom.building}</p>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Piso</p>
                    <p className="font-semibold text-slate-800">{selectedRoom.floor || 'N/A'}</p>
                  </div>
                </>
              )}
            </div>

            {/* Horarios de hoy */}
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Horarios de hoy</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {schedules
                  .filter(s => s.room?.id === selectedRoom.id)
                  .map((schedule, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">
                          {schedule.section?.offering?.course?.name || 'Sin curso'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {schedule.section?.code || 'Sin sección'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-600">
                          {schedule.timeslot?.start_time} - {schedule.timeslot?.end_time}
                        </p>
                        <p className="text-xs text-slate-500">
                          {schedule.timeslot?.day_of_week}
                        </p>
                      </div>
                    </div>
                  ))}
                {schedules.filter(s => s.room?.id === selectedRoom.id).length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No hay horarios programados</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}