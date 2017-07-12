import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      products: []
    };

    this.getProducts = this.getProducts.bind(this);
  }

  getProducts(products) {
    this.setState({
      products: products
    })
  }

  render() {
    let basket = this.state.products.length ? <Basket products={this.state.products} /> : null;

    return (
      <MuiThemeProvider>
        <div className="container">
          <AddProduct getProducts = {this.getProducts} />
          {basket}
        </div>
      </MuiThemeProvider>
    );
  }
}

class AddProduct extends Component {
  constructor(props) {
    super(props);

    this.state = {
      current: {
        name: '',
        price: '',
        errors: {
          nameError: '',
          priceError: ''
        }
      },
      products: []
    };

    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleFieldChange(e) {
    let current,
        errors = this.state.current.errors;

    if (errors[`${e.target.name}Error`] && e.target.value.length > 0) {
      errors[`${e.target.name}Error`] = '';
    }

    switch(e.target.name) {
      case 'name':
        current = {
          name: e.target.value,
          price: this.state.current.price,
          errors: errors
        };
        break;
      case 'price':
        current = {
          name: this.state.current.name,
          price: e.target.value >=0 ? e.target.value : 0,
          errors: errors
        };
        break;

      default:
        current = this.state.current;
    }

    this.setState({
      current: current
    })
  }

  handleClick() {
    let current = this.state.current,
        errors = {},
        isErr = false,
        products;

    for (let key in current) {
      switch(key) {
        case 'name':
          if (current[key] === '') {
            errors[`${key}Error`] = 'Введите название продукта';
            isErr = true;
          }
          break;
        case 'price':
          if (current[key] === '' || current[key] === '0') {
            errors[`${key}Error`] = 'Введите число больше нуля';
            isErr = true;
          }
          break;
        default: break;
      }
    }

    if (isErr) {
      this.setState({
        current: {
          name: this.state.current.name,
          price: this.state.current.price,
          errors: errors
        }
      });
    } else {
      products = this.state.products;
      products.push({
        name: current.name.trim(),
        price: current.price
      });

      this.props.getProducts(products);

      this.setState({
        current: {
          name: '',
          price: '',
          errors: {
            nameError: '',
            priceError: ''
          }
        },
        products: products
      });
    }
  }

  render() {
    return (
      <div className="add-product clearfix">
          <h1 className="add-product__header">Добавить продукт</h1>
          <div className="add-product__left clearfix">
            <div className="add-product__group">
              <TextField name="name" floatingLabelText="Продукт" onChange={this.handleFieldChange} fullWidth={true} errorText={this.state.current.errors.nameError} value={this.state.current.name}/>
            </div>
            <div className="add-product__group">
              <TextField name="price" floatingLabelText="Цена" onChange={this.handleFieldChange} type="number" fullWidth={true} errorText={this.state.current.errors.priceError} value={this.state.current.price}/>
            </div>
          </div>
          <div className="add-product__right">
            <RaisedButton className="add-product__btn" label="Добавить" onClick={this.handleClick} primary={true}/>
          </div>
      </div>
    )
  }
}

class Basket extends Component {
  constructor(props) {
    super(props);

    this.state = {
      discount: 5,
      discountPrices: [],
      errorText: ''
    };

    this.handleDiscountChange = this.handleDiscountChange.bind(this);
    this.applyDiscount = this.applyDiscount.bind(this);
  }

  handleDiscountChange(e) {

    let val = e.target.value,
        result = (val >= 0) ? val : 0;

    this.setState({
      discount: result,
      errorText: ''
    })
  }

  getSum() {
    let sum = 0;
    this.props.products.forEach(function(item) {
      sum += Number(item.price);
    });

    return sum;
  }

  applyDiscount() {
    let sum = this.getSum(),
        percentDiscount = Number(this.state.discount)/sum,
        discountPrices = [],
        diff,
        discountPricesSum = 0,
        maxPriceIndex = 0;

    if (this.state.discount === '') {
      this.setState({
        errorText: 'Введите число'
      });

      return;
    }

    this.props.products.forEach(function(item, index) {
      let discount = Math.round(item.price * percentDiscount),
          discountPrice = item.price - discount;

      discountPrices.push(discountPrice);

      discountPricesSum += discountPrice;

      if (discountPrice > discountPrices[maxPriceIndex]) {
        maxPriceIndex = index;
      }

    });

    diff = sum - (discountPricesSum + Number(this.state.discount));

    if(diff > 0) {
      discountPrices[maxPriceIndex] += diff;
    }

    this.setState({
      discount: Number(this.state.discount),
      discountPrices: discountPrices
    })
  }

  render() {
    let self = this;

    console.log(this.state);

    return (
      <div className="basket">
        <h1 className="basket__header">Корзина</h1>
        <div className="table-container">
          <Table fixedHeader={false} fixedFooter={false} selectable={false}>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
              <TableRow>
                <TableHeaderColumn className="table-cell">Продукт</TableHeaderColumn>
                <TableHeaderColumn className="table-cell">Цена</TableHeaderColumn>
                <TableHeaderColumn className="table-cell">Цена со скидкой</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {this.props.products.map( (row, index) => {
                let discountPrice = '---';

                if(self.state.discountPrices[index] || self.state.discountPrices[index] === 0) {
                  discountPrice = self.state.discountPrices[index];
                }
                return (
                  <TableRow key={index}>
                    <TableRowColumn className="table-cell">{row.name}</TableRowColumn>
                    <TableRowColumn className="table-cell">{Number(row.price)}</TableRowColumn>
                    <TableRowColumn className="table-cell">{discountPrice}</TableRowColumn>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        <div className="discount-container">
          <label className="discount-label_left" htmlFor="discount">Cкидка</label>
          <TextField id="discount" onChange={this.handleDiscountChange} type="number" style={{width: '65px', 'verticalAlign': 'top'}} width="50" errorText={this.state.errorText} value={this.state.discount} className="discount-field"/>
          <label className="discount-label_right" htmlFor="discount">рублей</label>
          <RaisedButton className="discount-btn" label="Применить" onClick={this.applyDiscount} primary={true}/>
        </div>
        <div className="commentary">
          Скидка по каждому товару округляется до ближайшего целого числа. Так как в условии задачи сказано, что сумма скидок всегда равна общей скидке,
          то цены со скидкой могут быть отрицательными.
        </div>
      </div>
    )
  }
}

export default App;
