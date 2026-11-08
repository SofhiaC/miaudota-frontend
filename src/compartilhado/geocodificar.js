// Provedor externo de mapas (OpenStreetMap/Nominatim): converte endereço em coordenadas.
// É o "Sistema Externo de Mapeamento" do C4. Não passa pelo gateway porque não é um serviço do Miaudota.
export async function geocodificar(endereco) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(endereco)}`;
  let res;
  try {
    res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
  } catch {
    throw new Error('Não foi possível buscar o endereço agora.');
  }
  if (!res.ok) throw new Error('Não foi possível buscar o endereço agora.');
  const [r] = await res.json();
  if (!r) throw new Error('Endereço não encontrado. Informe latitude e longitude.');
  return { latitude: Number(r.lat), longitude: Number(r.lon) };
}
