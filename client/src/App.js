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
        <div className="input-field" style={{textAlign: 'middle', margin: 'auto'}}>
          <select style={{display: 'block', width: '50%', margin: 'auto'}} defaultValue="" onChange={(e) => this.handleChange(e.target.value)}>
            <option value="" disabled>Select your weather condition...</option>
            {weatherOptions.map((option) => {
              return (
                <option value={option} key={option}>{option}</option>
              )
            })}
          </select>
        </div>
        {this.state.showCities && (
          <ul className='collection' style={{width: '60%', margin: 'auto', marginTop: 25, marginBottom: 25}}>
            {Object.keys(this.state.cityList).map((key, index) => {
              return (
                <li className='collection-item' key={index}>{key}, {this.state.cityList[key].state} Temperature {this.state.cityList[key].temperature} Wind Speed {this.state.cityList[key].wind}</li>
              )
            })}
          </ul>
        )}
        {this.state.showEmptyRes && (
          <p>No cities are experiencing this weather condition!</p>
        )}
      </div>
    );
  }
}

export default App;
