import React from "react";
import Map from "./map";
import "./App.css";
import DonutChart from "react-svg-donut-chart";
import LineChart from "react-linechart";
import { PuffLoader } from "react-spinners";
import axios from "axios";
const DATA = require("./data.json");

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: {},
      statesDaily: {},
      donutData: [],
      lineData: [
        {
          color: "steelblue",
          points: [],
        },
        {
          color: "red",
          points: [],
        },
        {
          color: "green",
          points: [],
        },
      ],
      confirmed: 0,
    };
  }

  componentDidMount() {
    let resdata = {};
    axios
      .get("https://api.covid19india.org/data.json")
      .then((data) => {
        resdata = data.data;
        axios
          .get("https://api.covid19india.org/states_daily.json")
          .then((data) => {
            this.setState({
              data: resdata,
              statesDaily: data.data,
              loading: false,
            });

            this.getChartData();
            this.getLineData();
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }

  getLineDataHook(state) {
    let data = this.state.statesDaily.states_daily;
    let set = [
      {
        color: "green",
        points: [],
      },
      {
        color: "red",
        points: [],
      },
      {
        color: "grey",
        points: [],
      },
    ];
    let date = {
      recovered: 0,
      confirmed: 0,
      des: 0,
    };
    for (let i = data.length - 3 * 7; i < data.length; i++) {
      if (data[i].status === "Recovered") {
        let tmp = data[i][state.toLowerCase()];
        set[0].points.push({ x: date.recovered, y: parseInt(tmp) });
        date.recovered++;
      } else if (data[i].status === "Confirmed") {
        let tmp = data[i][state.toLowerCase()];
        set[1].points.push({ x: date.confirmed, y: parseInt(tmp) });
        date.confirmed++;
      } else {
        let tmp = data[i][state.toLowerCase()];
        set[2].points.push({ x: date.des, y: parseInt(tmp) });
        date.des++;
      }
    }
    this.setState({
      lineData: set,
    });
  }

  getChartHook(str) {
    let data = this.state.data.statewise;
    for (let i = 1; i < data.length; i++) {
      if (data[i].statecode === str) {
        this.setState({
          donutData: [
            {
              label: "Active",
              value:
                (parseInt(data[i].active) / parseInt(data[i].confirmed)) * 100,
              stroke: "blue",
            },
            {
              label: "Deaths",
              value:
                (parseInt(data[i].deaths) / parseInt(data[i].confirmed)) * 100,
              stroke: "grey",
            },
            {
              label: "Recovered",
              value:
                (parseInt(data[i].recovered) / parseInt(data[i].confirmed)) *
                100,
              stroke: "green",
            },
          ],
          confirmed: data[i].confirmed,
        });
        break;
      }
    }
  }

  getLineData() {
    let data = this.state.data.cases_time_series;
    let set = [
      {
        color: "green",
        points: [],
      },
      {
        color: "red",
        points: [],
      },
      {
        color: "grey",
        points: [],
      },
    ];
    let date = 0;
    for (let i = data.length - 7; i < data.length; i++) {
      date++;
      set[0].points.push({ x: date, y: parseInt(data[i].totalrecovered) });
      set[1].points.push({ x: date, y: parseInt(data[i].totalconfirmed) });
      set[2].points.push({ x: date, y: parseInt(data[i].totaldeceased) });
    }
    this.setState({
      lineData: set,
    });
  }

  getChartData() {
    let data = this.state.data.statewise[0];
    this.setState({
      donutData: [
        {
          value: (parseInt(data.active) / parseInt(data.confirmed)) * 100,
          stroke: "blue",
        },
        {
          value: (parseInt(data.deaths) / parseInt(data.confirmed)) * 100,
          stroke: "grey",
        },
        {
          value: (parseInt(data.recovered) / parseInt(data.confirmed)) * 100,
          stroke: "green",
        },
      ],
      confirmed: data.confirmed,
    });
  }

  render() {
    return this.state.loading === true ? (
      <div className="loading">
        <PuffLoader size={75} />
      </div>
    ) : (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <div
          style={{ width: "48vw", display: "flex", flexDirection: "column" }}
        >
          <div
            style={{
              paddingLeft: "2vw",
              paddingTop: "2vh",
              display: "flex",
              flexDirection: "row",
              flex: 1,
            }}
          >
            <div
              style={{
                height: "35vh",
                width: "15vw",
                position: "relative",
                textAlign: "center",
                justifyContent: "center",
              }}
            >
              <DonutChart
                style={{ height: "35vh", width: "15vw" }}
                data={this.state.donutData}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  height: "35vh",
                  width: "15vw",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <div style={{ fontWeight: "bold" }}>Confirmed</div>
                <div>{this.state.confirmed}</div>
              </div>
            </div>

            <LineChart
              hideXAxis={true}
              hideYAxis={true}
              height={200}
              width={400}
              data={this.state.lineData}
              strokeWidth={4}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: "2vw",
              boxShadow: "0 0 5px rgba(0,0,0,0.5)",
              borderRadius: "20px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                fontWeight: "bold",
                height: "50px",
                alignItems: "center",
                color: "orange",
              }}
            >
              <div style={{ paddingLeft: "2.5vw", width: "15vw" }}>State</div>
              <div style={{ width: "10vw" }}>Confirmed</div>
              <div style={{ width: "10vw" }}>Active</div>
              <div style={{ width: "10vw" }}>Recovered</div>
            </div>
            <div
              style={{
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
                height: "50vh",
                alignSelf: "flex-end",
                paddingBottom: "20px",
              }}
            >
              {DATA.statewise.map((ele) =>
                ele.state !== "Total" ? (
                  <div
                    key={`${ele.statecode}`}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      paddingBottom: "20px"
                    }}
                  >
                    <div
                      style={{
                        width: "15vw",
                        paddingLeft: "5px",
                        paddingRight: "5px",
                      }}
                    >
                      {ele.state}
                    </div>
                    <div style={{ width: "10vw" }}>{ele.confirmed}</div>
                    <div style={{ width: "10vw" }}>{ele.active}</div>
                    <div style={{ width: "10vw" }}>{ele.recovered}</div>
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>
        <div style={{ width: "48vw" }}>
          <Map
            hookLine={(str) => this.getLineDataHook(str)}
            hookDefLine={() => this.getLineData()}
            hookChart={(str) => this.getChartHook(str)}
            hookDefChart={() => this.getChartData()}
            data={this.state.data}
          />
        </div>
      </div>
    );
  }
}

export default App;
