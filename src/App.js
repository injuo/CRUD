import "./styles.css";
import { React, forwardRef } from "react";
import Papa from "papaparse";
import MaterialTable from "material-table";
import { useState, useEffect } from "react";

import AddBox from "@material-ui/icons/AddBox";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";
//import axios from "axios";
import Alert from "@material-ui/lab/Alert";

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

export default function App() {
  /*
  var columns = [
    { title: "id", field: "id", hidden: true },
    { title: "String 1", field: "str1" },
    { title: "String 2", field: "str_2" }
  ];

  var data = [
    { title: "String 1", field: "str1" },
    { title: "String 2", field: "str_2" }
  ];
*/
  const [rows, setRows] = useState([]);
  const [output, setOutput] = useState([]);

  //for error handling
  const [iserror, setIserror] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  //𨙈啲set rows into useEffect
  useEffect(() => {
    async function getData() {
      console.time("Execution Time");
      const response = await fetch("/data/en2.csv");
      const reader = response.body.getReader();
      const result = await reader.read(); // raw array
      const decoder = new TextDecoder("utf-8");
      const csv = decoder.decode(result.value); // the csv text
      const results = Papa.parse(csv, { header: false }); // object with { data, errors, meta }
      const rows = results.data; // array of objects

      rows.unshift(["en", "zh"]);

      setRows(rows);
      //console.log(rows);

      var keys = rows.shift(),
        i = 0,
        k = 0,
        obj = null,
        output = [];

      for (i = 0; i < rows.length; i++) {
        obj = {};

        for (k = 0; k < keys.length; k++) {
          obj[keys[k]] = rows[i][k];
        }

        output.push(obj);
      }
      //console.log(output);
      setOutput(output);
      console.timeEnd("Execution Time");
      /*
      rows.map((item) => {
        console.log("item: ", item);
      });*/
    }
    getData();
  }, []);

  //CSV writer
  const createCsvWriter = require("csv-writer").createObjectCsvWriter;
  const csvWriter = createCsvWriter({
    path: "en2.csv",
    header: [
      { id: "en", title: "en" },
      { id: "zh", title: "zh" }
    ]
  });

  const handleRowUpdate = (newData, oldData, resolve) => {
    //validation
    let errorList = [];
    if (newData.en === "") {
      errorList.push("Please enter first name");
    }
    if (newData.zh === "") {
      errorList.push("Please enter last name");
    }

    if (newData.en === newData.zh) {
      errorList.push("Please enter a differnet word.");
    }

    if (errorList.length < 1) {
      /*
      api
        .patch("/users/" + newData.id, newData)
        .then((res) => {
          */
      const dataUpdate = [...output];
      const index = oldData.tableData.id;
      dataUpdate[index] = newData;
      setOutput([...dataUpdate]);
      console.log(output);
      console.log("output is done");

      const csvData = Papa.unparse(dataUpdate);

      resolve();
      setErrorMessages([]);
      setIserror(false);

      //console.log(rows)
      /*
      //write CSV
      csvWriter
        .writeRecords(rows) // returns a promise
        .then(() => {
          console.log("...Done");
        });
*/
    } else {
      setErrorMessages(errorList);
      setIserror(true);
      resolve();
    }
  };

  const handleRowAdd = (newData, resolve) => {
    //validation
    let errorList = [];
    if (newData.en === undefined) {
      errorList.push("Please enter first name");
    }
    if (newData.zh === undefined) {
      errorList.push("Please enter last name");
    }

    if (errorList.length < 1) {
      let dataToAdd = [...output];
      dataToAdd.push(newData);
      setOutput(dataToAdd);
      resolve();
      setErrorMessages([]);
      setIserror(false);
    } else {
      setErrorMessages(errorList);
      setIserror(true);
      resolve();
    }
  };

  const handleRowDelete = (oldData, resolve) => {
    const dataDelete = [...output];
    const index = oldData.tableData.id;
    dataDelete.splice(index, 1);
    setOutput([...dataDelete]);

    const csvData = Papa.unparse(dataDelete);

    resolve();
  };

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <div>
        {iserror && (
          <Alert severity="error">
            {errorMessages.map((msg, i) => {
              return <div key={i}>{msg}</div>;
            })}
          </Alert>
        )}
      </div>
      <MaterialTable
        columns={[
          { title: "", field: "en" },
          { title: "", field: "zh" }
        ]}
        data={[...output]}
        title="Demo Title"
        icons={tableIcons}
        editable={{
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve) => {
              handleRowUpdate(newData, oldData, resolve);
            }),
          onRowAdd: (newData) =>
            new Promise((resolve) => {
              handleRowAdd(newData, resolve);
            }),
          onRowDelete: (oldData) =>
            new Promise((resolve) => {
              handleRowDelete(oldData, resolve);
            })
        }}
        options={{
          exportButton: true
        }}
        /*
        components={{
          Pagination: props => (
            <TablePagination
            {...props}
           rowsPerPageOptions={[5, 10, 20, 30]}
       rowsPerPage={this.state.numberRowPerPage}
       count={this.state.totalRow}
       page={
         firstLoad
           ? this.state.pageNumber
           : this.state.pageNumber - 1
       }
       onChangePage={(e, page) =>
         this.handleChangePage(page + 1)
       }
       onChangeRowsPerPage={event => {
         props.onChangeRowsPerPage(event);
         this.handleChangeRowPerPage(event.target.value);
       }}

       */
      />
    </div>
  );
}
