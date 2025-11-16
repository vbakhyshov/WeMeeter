import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// 3. (Опционально, но рекомендуется) Хак для исправления иконок маркера
// Часто в React-сборках (Vite/Webpack) ломаются пути к картинкам маркеров.
// Этот код чинит это, загружая иконки вручную.
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41], // Точка "якоря" иконки (где ее "острие")
    popupAnchor: [1, -34] // Точка, откуда будет "всплывать" попап
});

L.Marker.prototype.options.icon = DefaultIcon;
// Конец хака

const HomePage = () => {

    // Зададим начальную позицию карты.
    // Я возьму координаты города Ульм (он был в твоем дизайне)
    const defaultPosition = [48.3994, 9.9933]; // Широта, Долгота

    return (
        // Твой div-контейнер. h-screen - это хорошо, он дает карте высоту.
        // Я убрал flex items-center, чтобы карта заняла все место.
        <div className="h-screen w-full">

            <MapContainer
                center={defaultPosition} // Центрируем карту на нашей позиции
                zoom={13} // Устанавливаем начальный зум
                style={{ height: "100%", width: "100%" }} // Карта ДОЛЖНА иметь явную высоту
            >
                {/* Это "слой" с самой картой (картинки-тайлы) */}
                <TileLayer
                    // Атрибуция - обязательна для OpenStreetMap
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    // URL, откуда мы "тянем" картинки карты
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={defaultPosition}>
                    <Popup>
                        You are here <br />
                    </Popup>
                </Marker>

            </MapContainer>
        </div>
    );
}

export default HomePage;