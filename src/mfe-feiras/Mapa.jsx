import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const VERDE = '#1f8a4c';
const LARANJA = '#e07b00';

/** Mapa interativo (Leaflet + OpenStreetMap) com um marcador por feira. Verde = acontecendo agora. */
export default function Mapa({ feiras, posicao }) {
  const elemento = useRef(null);
  const mapa = useRef(null);
  const camada = useRef(null);

  useEffect(() => {
    if (mapa.current) return undefined;
    mapa.current = L.map(elemento.current).setView([-14.2, -51.9], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapa.current);
    camada.current = L.layerGroup().addTo(mapa.current);
    return () => { mapa.current.remove(); mapa.current = null; };
  }, []);

  useEffect(() => {
    if (!mapa.current) return;
    camada.current.clearLayers();
    const pontos = [];

    feiras.forEach((f) => {
      const ponto = [f.latitude, f.longitude];
      pontos.push(ponto);
      // o popup é montado com textContent (e não com HTML) porque nome e endereço são digitados por usuários
      const popup = document.createElement('div');
      const titulo = document.createElement('strong');
      titulo.textContent = f.nome;
      const endereco = document.createElement('div');
      endereco.textContent = f.endereco;
      popup.append(titulo, endereco);
      if (f.acontecendoAgora) {
        const agora = document.createElement('div');
        agora.textContent = 'Acontecendo agora';
        popup.append(agora);
      }
      L.circleMarker(ponto, { radius: 11, color: '#fff', weight: 2, fillColor: f.acontecendoAgora ? VERDE : LARANJA, fillOpacity: 0.95 })
        .bindPopup(popup)
        .addTo(camada.current);
    });

    if (posicao) {
      const eu = [posicao.lat, posicao.lng];
      pontos.push(eu);
      L.circleMarker(eu, { radius: 8, color: '#fff', weight: 2, fillColor: '#2563eb', fillOpacity: 1 })
        .bindTooltip('Você está aqui')
        .addTo(camada.current);
    }

    if (pontos.length > 1) mapa.current.fitBounds(L.latLngBounds(pontos).pad(0.25), { maxZoom: 14 });
    else if (pontos.length === 1) mapa.current.setView(pontos[0], 13);
  }, [feiras, posicao]);

  return <div ref={elemento} className="mapa" role="application" aria-label="Mapa de feiras de adoção" />;
}
