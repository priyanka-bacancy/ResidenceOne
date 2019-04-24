import React, { Component } from 'react';

import './Userlist.css';

import { Link } from 'react-router-dom';

import { NavItem, NavLink, Nav, TabContent } from 'reactstrap';
import { DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { UncontrolledDropdown, Modal } from 'reactstrap';
import { FaEllipsisV } from 'react-icons/fa';

import classnames from 'classnames';
import Table from '../commonComponent/Table';
import { getToken } from '../../global';

import { getUserList } from '../api/Api'
import Adduser from './Adduser';
import axios from 'axios';

import _ from 'lodash';
import Profilepage from './Profilepage';

class Userlist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      filtered: [],
      filter_string: '',
      imagePath: '',
      totalRecords: '',
      activeTab: true,
      total_pages: '',
      current_page: 1,
      modal: false,
      selected: {},
      selectAll: 0,
      limit: 20,
      editUser: '',

      signup: {
        firstName: '',
        lastName: '',
        telephone: '',
        email: '',
        dateOfBirth: '',
        password: '',
        confirmPassword: '',
        note: '',
        selectedPosition: '',
        activeFrom: '',
        activeTo: '',
        companyName: '',
        activeDateRange: '',
        pool: false
      },
      positionList: [],
      isOpenPersonalDetail: false,
      isValidPassword: true,
      passwordMatch: true,
      profilePage: false,
      userDetail: '',
      userListPage: true
    }
    this.handleClick = this.handleClick.bind(this);
    this.addUserToggle = this.addUserToggle.bind(this);
    this.toggleRow = this.toggleRow.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    if (getToken()) {
      this.userList();
    }
  }

  userList() {
    const { activeTab, current_page, limit, filter_string } = this.state
    getUserList(activeTab, current_page, limit, filter_string)
      .then((res) => {
        this.setState({
          data: res.data.data,
          imagePath: res.data.imagePath,
          totalRecords: res.data.totalRecords,
          total_pages: Math.ceil(res.data.totalRecords / this.state.limit)
        })
        return res;
      })
  }

  addUserToggle() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  onFilteredChange(filtered) {
    if (filtered.length >= 0) {
      let string = '';
      for (let i = 0; i < filtered.length; i++) {
        string = string + `&${filtered[i].id}=${filtered[i].value}`;
      }
      this.setState({ filtered, filter_string: string }, () => this.userList())
    }
  }

  onPageChange(pageIndex) {
    this.setState({ current_page: pageIndex + 1 }, () => this.userList())
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
        current_page: 1
      }, () => this.userList());
    }
  }

  toggleRow(firstName) {
    const newSelected = Object.assign({}, this.state.selected);
    newSelected[firstName] = !this.state.selected[firstName];
    this.setState({
      selected: newSelected,
      selectAll: 2
    });
  }

  toggleSelectAll() {
    let newSelected = {};

    if (this.state.selectAll === 0) {
      this.state.data.forEach(x => {
        newSelected[x.firstName] = true;
      });
    }

    this.setState({
      selected: newSelected,
      selectAll: this.state.selectAll === 0 ? 1 : 0
    });
  }

  async handleClick() {
    let data = [];
    this.setState({ modal: !this.state.modal })
    let result = await axios.get(`http://localhost:8080/api/position/list`,
      {
        headers: { token: getToken() }
      });

    for (let i = 0; i < 19; i++) {
      data[i] = { label: `${result.data.data[i].name}`, value: `${result.data.data[i].id}` }
    }
    this.setState({ positionList: data || [] });
  }

  onPageSizeChange(pageSize) {
    this.setState({ limit: pageSize }, () => this.userList());
  }

  onChange(path, value) {
    let tempObj = _.cloneDeep(this.state);
    _.set(tempObj, path, value);
    this.setState({ ...tempObj })
  }

  handleChangePool() {
    let pool = this.state.signup;
    pool['pool'] = !this.state.signup.pool;
    this.setState({ signup: pool })
  }
  handleApply(event, picker) {
    let dateOfBirth = { ...this.state.signup };
    dateOfBirth['dateOfBirth'] = picker.startDate.format('YYYY/MM/DD')
    this.setState({ signup: dateOfBirth })
  }
  dateRange(event, picker) {
    let activeDateRange = { ...this.state.signup }
    let activeFrom = picker.startDate.format('YYYY/MM/DD');
    let activeTo = picker.endDate.format('YYYY/MM/DD')
    let finaldate = activeFrom + " - " + activeTo
    activeDateRange['activeDateRange'] = finaldate
    this.setState({ signup: activeDateRange, activeFrom, activeTo })
  }
  editToggle(row) {
    console.log(row);
    this.setState({ editUser: row })
  }

  addUser() {
    const { firstName, lastName, email, dateOfBirth, password, telephone, note, selectedPosition, pool, companyName } = this.state.signup;
    axios.post('http://localhost:8080/api/user/signup',
      {
        firstName: firstName,
        lastName: lastName,
        email: email,
        companyName: companyName,
        residenceId: '',
        telephone: telephone,
        dateOfBirth: dateOfBirth,
        password: password,
        familyId: '',
        personStatus: selectedPosition.label,
        activeFrom: this.state.activeFrom,
        activeTo: this.state.activeTo,
        manualPoolAccess: pool,
        note: note,
        status: '',
      },
      { headers: { token: getToken() } }
    )
      .then(() => {
        this.addUserToggle()
      })
  }
  validatePassword(e) {
    const password = e.target.value;
    let isValid = false;
    var re = /^(?=.*[A-Za-z0-9])[A-Za-z\d@$!%*#?&]{6,}$/;
    isValid = re.test(String(password).toLowerCase());
    this.setState({ isValidPassword: isValid });
  }
  passwordCheck() {
    if (this.state.signup.password === this.state.signup.confirmPassword) {
      this.setState({ passwordMatch: true })
    }
    else {
      this.setState({ passwordMatch: false })
    }
  }

  userProfile(row) {
    this.setState({ userListPage: false, profilePage: true, userDetail: row })
  }

  render() {
    const { activeTab, data, modal, selected, selectAll, imagePath } = this.state;
    const columns = [
      {
        Header: "",
        columns: [
          {
            id: "checkbox",
            accessor: "",
            Cell: ({ original }) => {
              return (
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={selected[original.firstName] === true}
                  onChange={() => this.toggleRow(original.firstName)}
                />
              );
            },
            Header: x => {
              return (
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={selectAll === 1}
                  ref={input => {
                    if (input) {
                      input.indeterminate = selectAll === 2;
                    }
                  }}
                  onChange={() => this.toggleSelectAll()}
                />
              );
            },
            filterable: false,
          },
        ]
      },
      {
        id: 'name',
        Header: 'Name',
        accessor: 'fullName',
        Cell: (row) => {
          console.log("dsf", row.original.id);
          return (
            <div>
              <Link to={`/admin/users/${row.original.id}`} onClick={() => this.userProfile(row.original)}>{row.value}</Link>
            </div>
          );
        },
      },
      {
        Header: 'Profile Picture',
        accessor: 'picture',
        Cell: (row) => {
          return (
            <div style={{ textAlign: "center" }}>
              <img alt='Img' height={34} src={imagePath + row.row.picture} />
            </div>
          )
        },
        filterable: false
      },
      {
        Header: 'Status',
        accessor: 'status',
        filterable: false,
      },
      {
        Header: 'Main unit ID',
        accessor: 'unitId',
      },
      {
        id: 'personStatus',
        Header: 'Position',
        accessor: 'personStatus',
      },
      {
        Header: 'Building',
        accessor: 'buildingId'
      },
      {
        Header: 'Type of unit',
        accessor: 'unitId'
      },
      {
        Header: 'Entry',
        accessor: 'entry'
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        id: 'dateOfbirth',
        Header: 'Date of Birth',
        accessor: 'dateOfBirth',
      },
      {
        Header: 'Mobile number',
        accessor: 'telephone',
      },
      {
        Header: '',
        style: { 'overflow': 'visible' },
        Cell: (row) => {
          return <div >
            <UncontrolledDropdown >
              <DropdownToggle id='dot-icon'>
                <FaEllipsisV />
              </DropdownToggle>
              <DropdownMenu id='dropdown-menu'>
                {this.state.activeTab === true ?
                  <DropdownItem>Mark User as Inactive</DropdownItem>
                  :
                  <DropdownItem>Mark User as Active</DropdownItem>
                }
              </DropdownMenu>
            </UncontrolledDropdown>
          </div>
        },
        filterable: false,
      }
    ]

    return (
      <div>
        {this.state.userListPage ?
          <div>
            <div id='buttongroup'>
              <Nav tabs>
                <NavItem>
                  <NavLink href="#" className={classnames({ active: activeTab === true })} onClick={() => { this.toggle(true); }}>Active</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink href="#" className={classnames({ active: activeTab === false })} onClick={() => { this.toggle(false); }}>Inactive</NavLink>
                </NavItem>
              </Nav>
            </div>

            <UncontrolledDropdown>
              <DropdownToggle id='dot-icon'>
                <FaEllipsisV />
              </DropdownToggle>
              <DropdownMenu >
                <DropdownItem onClick={() => this.handleClick()} >Add New User</DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>

            <TabContent activeTab={activeTab}>
              <Table
                data={data}
                columns={columns}
                values={this.state}
                onPageChange={pageIndex => this.onPageChange(pageIndex)}
                onPageSizeChange={(pageSize) => this.onPageSizeChange(pageSize)}
                onFilteredChange={(filtered) => this.onFilteredChange(filtered)}
              />
            </TabContent>

            <div>
              <Modal isOpen={modal} toggle={this.addUserToggle} size="lg">

                <Adduser
                  getValues={this.state}
                  addUserToggle={() => this.addUserToggle()}
                  onChange={(path, value) => this.onChange(path, value)}
                  handleApply={(event, picker) => this.handleApply(event, picker)}
                  dateRange={(event, picker) => this.dateRange(event, picker)}
                  onClickAction={() => this.addUser()}
                  handleChangePool={() => this.handleChangePool()}
                  validatePassword={(e) => this.validatePassword(e)}
                  passwordCheck={(e) => this.passwordCheck(e)}
                />

              </Modal>
            </div>
          </div>
          : <Profilepage />}


      </div>
    )
  }
}
export default Userlist;
