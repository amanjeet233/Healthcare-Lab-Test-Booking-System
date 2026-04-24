import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Clock, Plus, Trash2, Loader } from 'lucide-react';
import { doctorService } from '../../services/doctorService';

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface DoctorAvailabilityPanelProps {
  doctorId?: number;
  onClose?: () => void;
  onSuccess?: () => void;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const DoctorAvailabilityPanel: React.FC<DoctorAvailabilityPanelProps> = ({
  doctorId,
  onClose,
  onSuccess
}) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { control, watch, handleSubmit } = useForm({
    defaultValues: {
      day: 'Monday',
      startTime: '09:00',
      endTime: '17:00'
    }
  });

  const dayValue = watch('day');
  const startTime = watch('startTime');
  const endTime = watch('endTime');

  useEffect(() => {
    const loadAvailability = async () => {
      if (!doctorId) return;
      try {
        const availability = await doctorService.getDoctorAvailability(doctorId);
        if (availability?.slots) {
          setSlots(availability.slots);
        }
      } catch (err) {
        console.error('Error loading availability:', err);
      }
    };
    loadAvailability();
  }, [doctorId]);

  const addSlot = () => {
    if (!dayValue || !startTime || !endTime) {
      setError('Please fill all fields');
      return;
    }

    // Check if slot already exists
    if (slots.some(s => s.day === dayValue)) {
      setError(`${dayValue} already has a slot. Remove it first.`);
      return;
    }

    setSlots([...slots, { day: dayValue, startTime, endTime }]);
    setError('');
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const onSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      if (doctorId) {
        await doctorService.updateAvailability({ slots });
      } else {
        // For current doctor
        await doctorService.updateAvailability({ slots });
      }
      onSuccess?.();
    } catch (err) {
      setError((err as any).message || 'Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Manage Availability</h3>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Add Slot Form */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Add Time Slot</h4>

        <div className="grid grid-cols-3 gap-3 mb-3">
          {/* Day Select */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Day</label>
            <Controller
              name="day"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {WEEKDAYS.map(day => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
            <Controller
              name="startTime"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
            <Controller
              name="endTime"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </div>
        </div>

        <button
          onClick={addSlot}
          className="w-full px-3 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 border border-blue-200"
        >
          <Plus className="w-4 h-4" />
          Add Slot
        </button>
      </div>

      {/* Current Slots */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Current Slots</h4>

        {slots.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">No time slots added yet</p>
        ) : (
          <div className="space-y-2">
            {slots.map((slot, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{slot.day}</p>
                  <p className="text-xs text-gray-600">
                    {slot.startTime} - {slot.endTime}
                  </p>
                </div>
                <button
                  onClick={() => removeSlot(idx)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onSubmit}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};
