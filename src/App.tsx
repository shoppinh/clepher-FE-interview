import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { CandlestickDataFormat, IDataResponseFormat } from "./utils/type";

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

function App() {
  const apiEndpoint = "https://www.alphavantage.co/query";
  const [symbol, setSymbol] = useState("");
  const debouncedSymbol = useDebounce(symbol, 500);
  const [chartData, setChartData] = useState<CandlestickDataFormat[]>([]);
  const mapResponseToChartFormat = (
    data: IDataResponseFormat,
  ): CandlestickDataFormat[] => {
    return Object.keys(data["Time Series (Daily)"]).map((key) => {
      return {
        x: new Date(key),
        y: [
          parseFloat(data["Time Series (Daily)"][key]["1. open"]),
          parseFloat(data["Time Series (Daily)"][key]["2. high"]),
          parseFloat(data["Time Series (Daily)"][key]["3. low"]),
          parseFloat(data["Time Series (Daily)"][key]["4. close"]),
        ],
      };
    });
  };

  const options: ApexOptions = {
    chart: {
      type: "candlestick",
      height: "100%",
    },
    title: {
      text: 'Time Series (Daily)',
      align: "center",
    },
    xaxis: { type: "datetime" },
    yaxis: {
      tooltip: {
        enabled: true,
      },
    },
  };

  useEffect(() => {
    if (debouncedSymbol) {
      fetch(
        `${apiEndpoint}?function=TIME_SERIES_DAILY&symbol=${debouncedSymbol}&outputsize=compact&apikey=${process.env.REACT_APP_API_KEY}`,
      )
        .then((response) => response.json())
        .then((data: IDataResponseFormat) =>
          setChartData(mapResponseToChartFormat(data)),
        )
        .catch((error) => console.error("Error:", error));
    }
  }, [debouncedSymbol]);

  return (
    <div className="w-screen h-screen">
      <div className="container w-full h-full">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Enter a symbol"
          className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline text-center mb-4"
        />
        <ReactApexChart
          options={options}
          series={[{ data: chartData }]}
          type="candlestick"
          height="100%"
          width="100%"
        />
      </div>
    </div>
  );
}

export default App;
