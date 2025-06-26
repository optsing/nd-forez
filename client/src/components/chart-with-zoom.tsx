import { useRef } from "react"
import { Line } from "react-chartjs-2"
import { TypedChartComponent } from 'react-chartjs-2/dist/types'

const ChartWithZoom: TypedChartComponent<"line"> = (props) => {
    const chartRef = useRef<any>(null);
    const handleDoubleClick = () => {
        chartRef.current?.resetZoom();
    }
    return (
        <Line
            {...props}
            ref={chartRef}
            onDoubleClick={handleDoubleClick}
        />
    )
}

export default ChartWithZoom;
