import { Instagram, Twitter, Waves, Youtube } from "lucide-react";

export default function Footer() {
  return (
  <>
    {/* Footer */}
    <footer className="py-20 px-4 border-t border-gray-800 bg-gradient-to-t from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold mb-4 flex items-center justify-center space-x-3">
              <Waves className="w-10 h-10 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Sonic Universe
              </span>
            </h3>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Exploring the infinite possibilities of sound and technology
            </p>
          </div>
          
          <div className="flex justify-center space-x-8 mb-12">
            {[Instagram, Twitter, Youtube].map((Icon, index) => (
              <div
                key={index}
                className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer group"
              >
                <Icon className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
              </div>
            ))}
          </div>
          
          <div className="text-center text-gray-500">
            <p>&copy; 2024 Sonic Universe. Crafted with passion for audio excellence.</p>
          </div>
        </div>
      </footer>
  </>
  )
}
