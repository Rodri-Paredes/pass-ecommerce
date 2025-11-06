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
                <strong>Ancho/Pecho:</strong> Mide de un lado a otro del pecho, manteniendo la prenda plana.
              </div>
              <div>
                <strong>Largo:</strong> Mide desde la parte superior del hombro hasta el borde inferior de la prenda.
              </div>
              <div>
                <strong>Manga:</strong> Mide desde el hombro hasta el final de la manga.
              </div>
              <div>
                <strong>Cintura:</strong> Mide la cintura del pantalón de lado a lado en la parte superior.
              </div>
            </div>
          </section>

          {/* Poleras Boxy */}
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-semibold mb-6">Poleras Boxy</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="py-3 px-4 font-semibold">Talla</th>
                    <th className="py-3 px-4 font-semibold">Ancho (cm)</th>
                    <th className="py-3 px-4 font-semibold">Largo (cm)</th>
                    <th className="py-3 px-4 font-semibold">Manga (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-medium">S</td>
                    <td className="py-3 px-4">57</td>
                    <td className="py-3 px-4">64</td>
                    <td className="py-3 px-4">22</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-medium">M</td>
                    <td className="py-3 px-4">60</td>
                    <td className="py-3 px-4">66.5</td>
                    <td className="py-3 px-4">23</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-medium">L</td>
                    <td className="py-3 px-4">63</td>
                    <td className="py-3 px-4">69.5</td>
                    <td className="py-3 px-4">24</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Poleras Oversize */}
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-semibold mb-6">Poleras Oversize</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="py-3 px-4 font-semibold">Talla</th>
                    <th className="py-3 px-4 font-semibold">Ancho (cm)</th>
                    <th className="py-3 px-4 font-semibold">Largo (cm)</th>
                    <th className="py-3 px-4 font-semibold">Manga (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-medium">S</td>
                    <td className="py-3 px-4">64</td>
                    <td className="py-3 px-4">73</td>
                    <td className="py-3 px-4">23</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-medium">M</td>
                    <td className="py-3 px-4">66</td>
                    <td className="py-3 px-4">75</td>
                    <td className="py-3 px-4">24</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-medium">L</td>
                    <td className="py-3 px-4">69</td>
                    <td className="py-3 px-4">77</td>
                    <td className="py-3 px-4">25</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Hoodies */}
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-semibold mb-6">Hoodies</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="py-3 px-4 font-semibold">Talla</th>
                    <th className="py-3 px-4 font-semibold">Ancho Espalda (cm)</th>
                    <th className="py-3 px-4 font-semibold">Ancho Elástico (cm)</th>
                    <th className="py-3 px-4 font-semibold">Largo (cm)</th>
                    <th className="py-3 px-4 font-semibold">Manga (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-medium">S</td>
                    <td className="py-3 px-4">71</td>
                    <td className="py-3 px-4">46</td>
                    <td className="py-3 px-4">61</td>
                    <td className="py-3 px-4">53</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-medium">M</td>
                    <td className="py-3 px-4">73</td>
                    <td className="py-3 px-4">48</td>
                    <td className="py-3 px-4">63.5</td>
                    <td className="py-3 px-4">55</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-medium">L</td>
                    <td className="py-3 px-4">76</td>
                    <td className="py-3 px-4">48</td>
                    <td className="py-3 px-4">66</td>
                    <td className="py-3 px-4">55</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Pantalones Super Baggy */}
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-semibold mb-6">Pantalones Super Baggy</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="py-3 px-4 font-semibold">Talla</th>
                    <th className="py-3 px-4 font-semibold">Cintura (cm)</th>
                    <th className="py-3 px-4 font-semibold">Botapié (cm)</th>
                    <th className="py-3 px-4 font-semibold">Largo (m)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-medium">28</td>
                    <td className="py-3 px-4">38</td>
                    <td className="py-3 px-4">26</td>
                    <td className="py-3 px-4">1.03</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-medium">30</td>
                    <td className="py-3 px-4">40.5</td>
                    <td className="py-3 px-4">26</td>
                    <td className="py-3 px-4">1.05</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-medium">32</td>
                    <td className="py-3 px-4">43</td>
                    <td className="py-3 px-4">26</td>
                    <td className="py-3 px-4">1.06</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-medium">34</td>
                    <td className="py-3 px-4">44</td>
                    <td className="py-3 px-4">28</td>
                    <td className="py-3 px-4">1.07</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mt-8">
            <p className="text-sm text-yellow-900">
              <strong>¿Tienes dudas sobre tu talla?</strong> Contáctanos por WhatsApp al
              591 75131474 y te ayudaremos a elegir la talla perfecta para ti.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
