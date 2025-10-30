
import React, { useState, useMemo } from 'react';
import { Appointment, Client, Pet, AppointmentStatus } from '../types';
import { Modal } from './Modal';
import { PlusIcon, CalendarIcon } from './icons';

interface AppointmentsProps {
    appointments: Appointment[];
    clients: Client[];
    pets: Pet[];
    addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
    updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
}

const AppointmentForm: React.FC<{
    clients: Client[];
    pets: Pet[];
    onSubmit: (data: Omit<Appointment, 'id'>) => void;
    onClose: () => void;
}> = ({ clients, pets, onSubmit, onClose }) => {
    const [clientId, setClientId] = useState('');
    const [petId, setPetId] = useState('');
    const [date, setDate] = useState('');
    const [reason, setReason] = useState('');

    const availablePets = useMemo(() => pets.filter(p => p.ownerId === clientId), [pets, clientId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId || !petId || !date) return;
        onSubmit({ clientId, petId, date, reason, status: AppointmentStatus.SCHEDULED });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Cliente</label>
                <select value={clientId} onChange={e => { setClientId(e.target.value); setPetId(''); }} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500" required>
                    <option value="">Selecione um cliente</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            {clientId && (
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Pet</label>
                    <select value={petId} onChange={e => setPetId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500" required disabled={!availablePets.length}>
                        <option value="">{availablePets.length > 0 ? 'Selecione um pet' : 'Nenhum pet para este cliente'}</option>
                        {availablePets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700">Data e Hora</label>
                <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Motivo</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500" required />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600">Agendar</button>
            </div>
        </form>
    );
};

const getStatusColor = (status: AppointmentStatus) => {
    switch(status) {
        case AppointmentStatus.SCHEDULED: return 'bg-blue-100 text-blue-800';
        case AppointmentStatus.COMPLETED: return 'bg-green-100 text-green-800';
        case AppointmentStatus.CANCELED: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export const Appointments: React.FC<AppointmentsProps> = ({ appointments, clients, pets, addAppointment, updateAppointmentStatus }) => {
    const [isModalOpen, setModalOpen] = useState(false);

    const sortedAppointments = useMemo(() => 
        [...appointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [appointments]
    );

    const upcomingAppointments = sortedAppointments.filter(a => new Date(a.date) >= new Date() && a.status === AppointmentStatus.SCHEDULED);
    const pastAppointments = sortedAppointments.filter(a => new Date(a.date) < new Date() || a.status !== AppointmentStatus.SCHEDULED);


    const findClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Desconhecido';
    const findPetName = (id: string) => pets.find(p => p.id === id)?.name || 'Desconhecido';
    
    return (
        <div className="p-8">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold text-gray-800">Agendamentos</h1>
                <button onClick={() => setModalOpen(true)} className="flex items-center px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 shadow">
                    <PlusIcon className="w-5 h-5 mr-2" /> Novo Agendamento
                </button>
            </div>

            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Próximos Agendamentos</h2>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                           {upcomingAppointments.length > 0 ? upcomingAppointments.map(app => (
                               <li key={app.id} className="p-4 space-y-2">
                                   <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-lg text-gray-800">{findClientName(app.clientId)} - <span className="font-semibold">{findPetName(app.petId)}</span></p>
                                            <p className="text-gray-600">{new Date(app.date).toLocaleString('pt-BR')}</p>
                                            <p className="text-sm text-gray-500 mt-1">{app.reason}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>{app.status}</span>
                                            <button onClick={() => updateAppointmentStatus(app.id, AppointmentStatus.COMPLETED)} className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">Concluir</button>
                                            <button onClick={() => updateAppointmentStatus(app.id, AppointmentStatus.CANCELED)} className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">Cancelar</button>
                                        </div>
                                   </div>
                               </li>
                           )) : <p className="p-4 text-gray-500">Nenhum agendamento futuro.</p>}
                        </ul>
                    </div>
                </div>
                 <div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Histórico</h2>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                           {pastAppointments.length > 0 ? pastAppointments.map(app => (
                               <li key={app.id} className="p-4">
                                   <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-gray-800">{findClientName(app.clientId)} - <span className="font-semibold">{findPetName(app.petId)}</span></p>
                                            <p className="text-gray-600">{new Date(app.date).toLocaleString('pt-BR')}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>{app.status}</span>
                                   </div>
                               </li>
                           )) : <p className="p-4 text-gray-500">Nenhum agendamento no histórico.</p>}
                        </ul>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Novo Agendamento">
                <AppointmentForm clients={clients} pets={pets} onSubmit={addAppointment} onClose={() => setModalOpen(false)} />
            </Modal>
        </div>
    );
};
