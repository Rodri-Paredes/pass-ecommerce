import { Link } from 'react-router-dom';
import { ArrowLeft, Ruler } from 'lucide-react';

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm mb-8 hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <h1 className="text-4xl font-bold mb-8 tracking-tight">GUÍA DE TALLAS</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Ruler className="w-6 h-6" />
              <h2 className="text-2xl font-semibold">Cómo Medir</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <strong>Pecho:</strong> Mide alrededor de la parte más ancha del pecho,
                manteniendo la cinta métrica horizontal.
              </div>
              <div>
                <strong>Cintura:</strong> Mide alrededor de la parte más estrecha de tu cintura,
                normalmente justo encima del ombligo.
              </div>
              <div>
                <strong>Cadera:</strong> Mide alrededor de la parte más ancha de tus caderas.
              </div>
            </div>
          </section>

          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-semibold mb-6">Hoodies y Camisas</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="py-3 px-4 font-semibold">Talla</th>
                    <th className="py-3 px-4 font-semibold">Pecho (cm)</th>
                    <th className="py-3 px-4 font-semibold">Largo (cm)</th>
                    <th className="py-3 px-4 font-semibold">Manga (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4">XS</td>
                    <td className="py-3 px-4">88-92</td>
                    <td className="py-3 px-4">66-68</td>
                    <td className="py-3 px-4">58-60</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4">S</td>
                    <td className="py-3 px-4">92-96</td>
                    <td className="py-3 px-4">68-70</td>
                    <td className="py-3 px-4">60-62</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4">M</td>
                    <td className="py-3 px-4">96-100</td>
                    <td className="py-3 px-4">70-72</td>
                    <td className="py-3 px-4">62-64</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4">L</td>
                    <td className="py-3 px-4">100-104</td>
                    <td className="py-3 px-4">72-74</td>
                    <td className="py-3 px-4">64-66</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4">XL</td>
                    <td className="py-3 px-4">104-108</td>
                    <td className="py-3 px-4">74-76</td>
                    <td className="py-3 px-4">66-68</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">XXL</td>
                    <td className="py-3 px-4">108-114</td>
                    <td className="py-3 px-4">76-78</td>
                    <td className="py-3 px-4">68-70</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-semibold mb-6">Pantalones y Shorts</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="py-3 px-4 font-semibold">Talla</th>
                    <th className="py-3 px-4 font-semibold">Cintura (cm)</th>
                    <th className="py-3 px-4 font-semibold">Cadera (cm)</th>
                    <th className="py-3 px-4 font-semibold">Largo (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4">XS</td>
                    <td className="py-3 px-4">70-74</td>
                    <td className="py-3 px-4">86-90</td>
                    <td className="py-3 px-4">100-102</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4">S</td>
                    <td className="py-3 px-4">74-78</td>
                    <td className="py-3 px-4">90-94</td>
                    <td className="py-3 px-4">102-104</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4">M</td>
                    <td className="py-3 px-4">78-82</td>
                    <td className="py-3 px-4">94-98</td>
                    <td className="py-3 px-4">104-106</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4">L</td>
                    <td className="py-3 px-4">82-86</td>
                    <td className="py-3 px-4">98-102</td>
                    <td className="py-3 px-4">106-108</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4">XL</td>
                    <td className="py-3 px-4">86-92</td>
                    <td className="py-3 px-4">102-106</td>
                    <td className="py-3 px-4">108-110</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">XXL</td>
                    <td className="py-3 px-4">92-98</td>
                    <td className="py-3 px-4">106-112</td>
                    <td className="py-3 px-4">110-112</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mt-8">
            <p className="text-sm text-yellow-900">
              <strong>¿Tienes dudas sobre tu talla?</strong> Contáctanos por WhatsApp al
              591 75767850 y te ayudaremos a elegir la talla perfecta para ti.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
