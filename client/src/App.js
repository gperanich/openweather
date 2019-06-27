import React from 'react';
import './App.css';

const weatherOptions = ['Thunderstorm', 'Drizzle', 'Rain', 'Snow', 'Atmosphere', 'Clear', 'Clouds'];

class App extends React.Component {
  state = {
    activeCondition: '',
    cityList: {},
    showCities: false,
    showEmptyRes: false
  }
  handleChange = (val) => {
    console.log('value', val);
    fetch(`/weather/${val}`)
      .then(res => res.json())
      .then((res) => {
        if (Object.keys(res).length) {
          this.setState({
            cityList: res,
            showCities: true,
            showEmptyRes: false
          })
        } else {
          this.setState({
            cityList: {},
            showCities: false,
            showEmptyRes: true
          })
        }
        
      })
      .catch((err) => {
        console.log('err', err);
      })
  }
  render() {
    console.log(this.state)
    return (
      <div className="App">
        <h1>Weather App</h1>
        <select defaultValue="" onChange={(e) => this.handleChange(e.target.value)}>
          <option value="" disabled>Select your weather condition...</option>
          {weatherOptions.map((option) => {
            return (
              <option value={option} key={option}>{option}</option>
            )
          })}
        </select>
          {this.state.showCities && (
            <div>
              {Object.keys(this.state.cityList).map((key, index) => {
                return (
                  <p key={index}>{key}, {this.state.cityList[key].state} Temperature {this.state.cityList[key].temperature} Wind Speed {this.state.cityList[key].wind}</p>
                )
              })}
            </div>
          )}
          {this.state.showEmptyRes && (
            <p>No cities are experiencing this weather condition!</p>
          )}
      </div>
    );
  }
}

export default App;
