// Salve como: src/components/MobileHeader.tsx
import { Menu, Scissors } from 'lucide-react';

interface MobileHeaderProps {
    onToggleSidebar: () => void;
}

export default function MobileHeader({ onToggleSidebar }: MobileHeaderProps) {
    return (
        // Este header só aparece em telas 'md' (768px) ou menores
        <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm sticky top-0 z-30">
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                    <Scissors size={16} />
                </div>
                <h1 className="font-bold text-gray-900">AgendPro</h1>
            </div>
            <button
                onClick={onToggleSidebar}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <Menu size={24} className="text-gray-600" />
            </button>
        </div>
    );
}