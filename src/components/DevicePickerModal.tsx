import React from 'react';
import { X, Smartphone, Laptop, Radio, Headphones, Check } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const DevicePickerModal: React.FC = () => {
  const { isDevicePickerOpen, setIsDevicePickerOpen, currentDevice, setCurrentDevice } = usePlayer();

  if (!isDevicePickerOpen) return null;

  const devices = [
    { name: 'iPhone 16 Pro', type: 'phone', icon: Smartphone },
    { name: 'Living Room Echo Studio', type: 'speaker', icon: Radio },
    { name: 'MacBook Pro', type: 'laptop', icon: Laptop },
    { name: 'AirPods Pro (2nd gen)', type: 'headphones', icon: Headphones },
  ];

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#242424] rounded-t-3xl p-6 border-t border-white/10 shadow-2xl flex flex-col max-h-[80%]">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h2 className="text-base font-bold text-white">Connect to a device</h2>
          <button
            onClick={() => setIsDevicePickerOpen(false)}
            className="p-1 text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="py-4 space-y-2">
          {devices.map((dev) => {
            const isSelected = dev.name === currentDevice;
            const Icon = dev.icon;
            return (
              <div
                key={dev.name}
                onClick={() => {
                  setCurrentDevice(dev.name);
                  setTimeout(() => setIsDevicePickerOpen(false), 200);
                }}
                className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#1db954]/10 text-[#1db954]' : 'hover:bg-white/5 text-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon size={22} className={isSelected ? 'text-[#1db954]' : 'text-white/60'} />
                  <div>
                    <p className={`text-sm font-semibold ${isSelected ? 'text-[#1db954]' : 'text-white'}`}>
                      {dev.name}
                    </p>
                    <p className="text-xs text-white/50 capitalize">
                      {isSelected ? 'Current device' : 'Fifty Connect / AirPlay'}
                    </p>
                  </div>
                </div>

                {isSelected && <Check size={18} className="text-[#1db954]" />}
              </div>
            );
          })}
        </div>

        <div className="pt-2 text-center text-xs text-white/40">
          Control audio seamlessly across all your devices with Fifty Connect.
        </div>
      </div>
    </div>
  );
};
