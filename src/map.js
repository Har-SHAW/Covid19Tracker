import React, { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import ReactTooltip from "react-tooltip";
import "./App.css";

/*
 * https://api.covid19india.org/states_daily.json
 * https://api.covid19india.org/data.json
 */
const INDIA_TOPO_JSON = require("./india.topo.json");

const PROJECTION_CONFIG = {
  scale: 350,
  center: [78.9629, 22.5937], // always in [East Latitude, North Longitude]
};

// const COLOR_RANGE = ["#F6BDC0", "#F1959B", "#F07470", "#EA4C46", "#DC1C13"];
const COLOR_RANGE = [
  "rgb(225,225,225)",
  "rgb(225,200,200)",
  "rgb(225,175,175)",
  "rgb(225,150,150)",
  "rgb(225,125,125)",
  "rgb(225,100,100)",
  "rgb(225,75,75)",
  "rgb(225,50,50)",
  "rgb(225,25,25)",
  "rgb(225,0,0)",
];
const DEFAULT_COLOR = "#EEE";

const geographyStyle = {
  default: {
    outline: "none",
  },
  hover: {
    fill: "#ccc",
    transition: "all 250ms",
    outline: "none",
  },
  pressed: {
    outline: "none",
  },
};

function Map(props) {
  const [tooltipContent, setTooltipContent] = useState("");
  const data = props.data.statewise;
  const [blockData, setBlockData] = useState({
    confirmed: props.data.statewise[0].confirmed,
    deaths: props.data.statewise[0].deaths,
    active: props.data.statewise[0].active,
    recovered: props.data.statewise[0].recovered,
  });

  const colorScale = scaleQuantile()
    .domain(data.map((d) => d.confirmed))
    .range(COLOR_RANGE);

  const onMouseEnter = (geo) => {
    return () => {
      props.hookLine(geo.id);
      props.hookChart(geo.id);
      let data = props.data.statewise;
      for (let i = 1; i < data.length; i++) {
        if (data[i].statecode === geo.id) {
          setBlockData((prev) => {
            let tmp = prev;
            tmp.confirmed = data[i].confirmed;
            tmp.deaths = data[i].deaths;
            tmp.active = data[i].active;
            tmp.recovered = data[i].recovered;
            return tmp;
          });
        }
      }
      setTooltipContent(
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>
            {geo.properties.name}
          </div>
        </div>
      );
    };
  };

  const onMouseLeave = () => {
    props.hookDefLine();
    props.hookDefChart();
    let data = props.data.statewise[0];
    setBlockData((prev) => {
      let tmp = prev;
      tmp.confirmed = data.confirmed;
      tmp.deaths = data.deaths;
      tmp.active = data.active;
      tmp.recovered = data.recovered;
      return tmp;
    });
    setTooltipContent("");
  };

  return (
    <div className="full-width-height container">
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          textAlign: "center",
        }}
      >
        <div
          style={{
            height: "10vh",
            width: "10vw",
            display: "flex",
            flexDirection: "column",
            background: "rgba(255,0,0,0.2)",
            justifyContent: "center",
            borderRadius: "2vh",
            border: "3px solid red",
          }}
        >
          <div style={{ color: "red", fontWeight: "bold" }}>Confirmed</div>
          <div style={{ color: "red" }}>{blockData.confirmed}</div>
        </div>
        <div
          style={{
            height: "10vh",
            width: "10vw",
            display: "flex",
            flexDirection: "column",
            background: "rgba(0,0,255,0.2)",
            justifyContent: "center",
            borderRadius: "2vh",
            border: "3px solid blue",
          }}
        >
          <div style={{ color: "blue", fontWeight: "bold" }}>Active</div>
          <div style={{ color: "blue" }}>{blockData.active}</div>
        </div>
        <div
          style={{
            height: "10vh",
            width: "10vw",
            display: "flex",
            flexDirection: "column",
            background: "rgba(0,255,0,0.2)",
            justifyContent: "center",
            borderRadius: "2vh",
            border: "3px solid green",
          }}
        >
          <div style={{ color: "green", fontWeight: "bold" }}>Recovered</div>
          <div style={{ color: "green" }}>{blockData.recovered}</div>
        </div>
        <div
          style={{
            height: "10vh",
            width: "10vw",
            display: "flex",
            flexDirection: "column",
            background: "rgba(128,128,128,0.2)",
            justifyContent: "center",
            borderRadius: "2vh",
            border: "3px solid grey",
          }}
        >
          <div style={{ color: "grey", fontWeight: "bold" }}>Deaths</div>
          <div style={{ color: "grey" }}>{blockData.deaths}</div>
        </div>
      </div>

      <ReactTooltip multiline>{tooltipContent}</ReactTooltip>
      <ComposableMap
        projectionConfig={PROJECTION_CONFIG}
        projection="geoMercator"
        width={300}
        height={220}
        data-tip=""
      >
        <Geographies geography={INDIA_TOPO_JSON}>
          {({ geographies }) =>
            geographies.map((geo) => {
              //console.log(geo.id);
              const current = data.find((s) => s.statecode === geo.id);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={current ? colorScale(current.confirmed) : DEFAULT_COLOR}
                  style={geographyStyle}
                  onMouseEnter={onMouseEnter(geo)}
                  onMouseLeave={onMouseLeave}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}

export default Map;
