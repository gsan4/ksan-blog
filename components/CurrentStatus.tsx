import React, { useState, useEffect, FC } from 'react';
import { fetchCurrentWeather } from '../services/keywordService';
import type { WeatherData } from '../types';

export const CurrentStatus: FC = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                let coords: { lat?: number; lon?: number } = {};
                if ('geolocation' in navigator) {
                    await new Promise<void>((resolve) => {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                coords = {
                                    lat: position.coords.latitude,
                                    lon: position.coords.longitude
                                };
                                resolve();
                            },
                            (err) => {
                                console.warn("Geolocation permission denied or failed, using default Seoul coordinates:", err);
                                resolve();
                            },
                            { timeout: 5000 }
                        );
                    });
                }
                const weatherData = await fetchCurrentWeather(coords.lat, coords.lon);
                setWeather(weatherData);
            } catch (e) {
                console.error("Failed to fetch weather", e);
                setWeather({condition: '날씨 정보 로딩 실패', temperature: '', wind: '', humidity: '', cityName: '서울시'});
            }
        };
        fetchWeather();
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const formattedDate = new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
    }).format(time);

    const formattedTime = new Intl.DateTimeFormat('ko-KR', {
        hour: '2-digit', minute: '2-digit', hour12: true
    }).format(time);

    const cityDisplayName = weather?.cityName || '서울시';

    return (
        <div className="text-xs text-slate-400 font-normal flex flex-col sm:flex-row items-end sm:items-center space-y-0.5 sm:space-y-0 sm:space-x-2 text-right">
            <span>{formattedDate} {formattedTime}</span>
            {weather && (
                <span className="text-slate-500">
                    {cityDisplayName}(현재 지역): {weather.condition}, {weather.temperature}°C
                </span>
            )}
        </div>
    )
}
