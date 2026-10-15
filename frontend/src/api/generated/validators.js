// Generated from backend/fixtures/openapi.json; do not edit.
import * as formatModule from "ajv-formats/dist/formats.js";
"use strict";
export const validateAnalysisResponse = validate20;
const schema31 = {"$id":"validateAnalysisResponse","$ref":"handoff#/components/schemas/AnalysisResponse"};
const schema33 = {"properties":{"region":{"$ref":"#/components/schemas/AnalysisRegion"},"period":{"$ref":"#/components/schemas/Period"},"methodology":{"$ref":"#/components/schemas/Methodology"},"summary":{"$ref":"#/components/schemas/Summary"},"annual_metrics":{"items":{"$ref":"#/components/schemas/AnnualMetrics"},"type":"array","title":"Annual Metrics"},"trend":{"$ref":"#/components/schemas/Trend"},"events":{"items":{"$ref":"#/components/schemas/Event"},"type":"array","title":"Events"},"insights":{"items":{"type":"string"},"type":"array","title":"Insights"},"data_quality":{"$ref":"#/components/schemas/DataQuality"},"source":{"$ref":"#/components/schemas/Source"}},"additionalProperties":false,"type":"object","required":["region","period","methodology","summary","annual_metrics","trend","events","insights","data_quality","source"],"title":"AnalysisResponse"};
const schema34 = {"properties":{"id":{"type":"string","enum":["delhi","mumbai","bengaluru","chennai","hyderabad"],"title":"Id"},"name":{"type":"string","title":"Name"},"latitude":{"type":"number","title":"Latitude"},"longitude":{"type":"number","title":"Longitude"},"timezone":{"type":"string","title":"Timezone"}},"additionalProperties":false,"type":"object","required":["id","name","latitude","longitude","timezone"],"title":"AnalysisRegion"};
const schema35 = {"properties":{"start_year":{"type":"integer","title":"Start Year"},"end_year":{"type":"integer","title":"End Year"},"hazard":{"type":"string","const":"heatwave","title":"Hazard"}},"additionalProperties":false,"type":"object","required":["start_year","end_year","hazard"],"title":"Period"};
const schema39 = {"properties":{"event_count":{"type":"integer","minimum":0,"title":"Event Count"},"heatwave_days":{"type":"integer","minimum":0,"title":"Heatwave Days"},"mean_duration_days":{"anyOf":[{"type":"number"},{"type":"null"}],"title":"Mean Duration Days"},"max_duration_days":{"anyOf":[{"type":"integer"},{"type":"null"}],"title":"Max Duration Days"},"mean_exceedance_celsius":{"anyOf":[{"type":"number"},{"type":"null"}],"title":"Mean Exceedance Celsius"},"peak_temperature_celsius":{"anyOf":[{"type":"number"},{"type":"null"}],"title":"Peak Temperature Celsius"},"complete":{"type":"boolean","title":"Complete"},"partial":{"type":"boolean","title":"Partial"},"eligible_year_count":{"type":"integer","title":"Eligible Year Count"},"selected_year_count":{"type":"integer","title":"Selected Year Count"},"excluded_boundary_event_count":{"type":"integer","title":"Excluded Boundary Event Count"}},"additionalProperties":false,"type":"object","required":["event_count","heatwave_days","mean_duration_days","max_duration_days","mean_exceedance_celsius","peak_temperature_celsius","complete","partial","eligible_year_count","selected_year_count","excluded_boundary_event_count"],"title":"Summary"};
const schema40 = {"properties":{"year":{"type":"integer","title":"Year"},"expected_days":{"type":"integer","title":"Expected Days"},"valid_days":{"type":"integer","title":"Valid Days"},"coverage":{"type":"number","title":"Coverage"},"event_count":{"type":"integer","minimum":0,"title":"Event Count"},"heatwave_days":{"type":"integer","minimum":0,"title":"Heatwave Days"},"mean_duration_days":{"anyOf":[{"type":"number"},{"type":"null"}],"title":"Mean Duration Days"},"max_duration_days":{"anyOf":[{"type":"integer"},{"type":"null"}],"title":"Max Duration Days"},"mean_exceedance_celsius":{"anyOf":[{"type":"number"},{"type":"null"}],"title":"Mean Exceedance Celsius"},"peak_temperature_celsius":{"anyOf":[{"type":"number"},{"type":"null"}],"title":"Peak Temperature Celsius"},"complete":{"type":"boolean","title":"Complete"},"partial":{"type":"boolean","title":"Partial"},"incomplete_reasons":{"items":{"type":"string"},"type":"array","title":"Incomplete Reasons"},"rolling_average_event_count":{"anyOf":[{"type":"number"},{"type":"null"}],"title":"Rolling Average Event Count"}},"additionalProperties":false,"type":"object","required":["year","expected_days","valid_days","coverage","event_count","heatwave_days","mean_duration_days","max_duration_days","mean_exceedance_celsius","peak_temperature_celsius","complete","partial","incomplete_reasons","rolling_average_event_count"],"title":"AnnualMetrics"};
const schema46 = {"properties":{"observed_start_date":{"type":"string","format":"date","title":"Observed Start Date"},"observed_end_date":{"type":"string","format":"date","title":"Observed End Date"},"observed_duration_days":{"type":"integer","title":"Observed Duration Days"},"start_date":{"anyOf":[{"type":"string","format":"date"},{"type":"null"}],"title":"Start Date"},"end_date":{"anyOf":[{"type":"string","format":"date"},{"type":"null"}],"title":"End Date"},"duration_days":{"anyOf":[{"type":"integer"},{"type":"null"}],"title":"Duration Days"},"peak_temperature_celsius":{"anyOf":[{"type":"number"},{"type":"null"}],"title":"Peak Temperature Celsius"},"mean_exceedance_celsius":{"anyOf":[{"type":"number"},{"type":"null"}],"title":"Mean Exceedance Celsius"},"observed_peak_temperature_celsius":{"type":"number","title":"Observed Peak Temperature Celsius"},"observed_mean_exceedance_celsius":{"type":"number","title":"Observed Mean Exceedance Celsius"},"truncated_start":{"type":"boolean","title":"Truncated Start"},"truncated_end":{"type":"boolean","title":"Truncated End"},"qualification_confirmed":{"type":"boolean","title":"Qualification Confirmed"},"started_in_selection":{"anyOf":[{"type":"boolean"},{"type":"null"}],"title":"Started In Selection"},"eligible_for_complete_metrics":{"type":"boolean","title":"Eligible For Complete Metrics"}},"additionalProperties":false,"type":"object","required":["observed_start_date","observed_end_date","observed_duration_days","start_date","end_date","duration_days","peak_temperature_celsius","mean_exceedance_celsius","observed_peak_temperature_celsius","observed_mean_exceedance_celsius","truncated_start","truncated_end","qualification_confirmed","started_in_selection","eligible_for_complete_metrics"],"title":"Event"};
const func1 = Object.prototype.hasOwnProperty;
const schema36 = {"properties":{"baseline_start_year":{"type":"integer","title":"Baseline Start Year"},"baseline_end_year":{"type":"integer","title":"Baseline End Year"},"percentile":{"type":"integer","title":"Percentile"},"percentile_method":{"type":"string","const":"linear","title":"Percentile Method"},"threshold_method_version":{"type":"string","title":"Threshold Method Version"},"threshold_celsius":{"type":"number","title":"Threshold Celsius"},"temperature_variable":{"type":"string","const":"temperature_2m_max","title":"Temperature Variable"},"temperature_unit":{"type":"string","title":"Temperature Unit"},"comparison":{"type":"string","const":">","title":"Comparison"},"minimum_coverage":{"type":"number","title":"Minimum Coverage"},"seasonal_adjustment":{"type":"boolean","const":false,"title":"Seasonal Adjustment"},"limitation":{"type":"string","title":"Limitation"},"baseline_quality":{"$ref":"#/components/schemas/BaselineQuality"},"method_version":{"type":"string","title":"Method Version"},"minimum_run_days":{"type":"integer","const":3,"title":"Minimum Run Days"}},"additionalProperties":false,"type":"object","required":["baseline_start_year","baseline_end_year","percentile","percentile_method","threshold_method_version","threshold_celsius","temperature_variable","temperature_unit","comparison","minimum_coverage","seasonal_adjustment","limitation","baseline_quality","method_version","minimum_run_days"],"title":"Methodology"};
const schema37 = {"properties":{"expected_days":{"type":"integer","title":"Expected Days"},"valid_days":{"type":"integer","title":"Valid Days"},"coverage":{"type":"number","title":"Coverage"},"years":{"items":{"$ref":"#/components/schemas/Coverage"},"type":"array","title":"Years"}},"additionalProperties":false,"type":"object","required":["expected_days","valid_days","coverage","years"],"title":"BaselineQuality"};
const schema38 = {"properties":{"year":{"type":"integer","title":"Year"},"expected_days":{"type":"integer","title":"Expected Days"},"valid_days":{"type":"integer","title":"Valid Days"},"coverage":{"type":"number","title":"Coverage"}},"additionalProperties":false,"type":"object","required":["year","expected_days","valid_days","coverage"],"title":"Coverage"};

function validate24(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate24.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((((data.expected_days === undefined) && (missing0 = "expected_days")) || ((data.valid_days === undefined) && (missing0 = "valid_days"))) || ((data.coverage === undefined) && (missing0 = "coverage"))) || ((data.years === undefined) && (missing0 = "years"))){
validate24.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((((key0 === "expected_days") || (key0 === "valid_days")) || (key0 === "coverage")) || (key0 === "years"))){
validate24.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.expected_days !== undefined){
let data0 = data.expected_days;
const _errs2 = errors;
if(!(((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0))) && (isFinite(data0)))){
validate24.errors = [{instancePath:instancePath+"/expected_days",schemaPath:"#/properties/expected_days/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.valid_days !== undefined){
let data1 = data.valid_days;
const _errs4 = errors;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
validate24.errors = [{instancePath:instancePath+"/valid_days",schemaPath:"#/properties/valid_days/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.coverage !== undefined){
let data2 = data.coverage;
const _errs6 = errors;
if(!((typeof data2 == "number") && (isFinite(data2)))){
validate24.errors = [{instancePath:instancePath+"/coverage",schemaPath:"#/properties/coverage/type",keyword:"type",params:{type: "number"},message:"must be number"}];
return false;
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.years !== undefined){
let data3 = data.years;
const _errs8 = errors;
if(errors === _errs8){
if(Array.isArray(data3)){
var valid1 = true;
const len0 = data3.length;
for(let i0=0; i0<len0; i0++){
let data4 = data3[i0];
const _errs10 = errors;
const _errs11 = errors;
if(errors === _errs11){
if(data4 && typeof data4 == "object" && !Array.isArray(data4)){
let missing1;
if(((((data4.year === undefined) && (missing1 = "year")) || ((data4.expected_days === undefined) && (missing1 = "expected_days"))) || ((data4.valid_days === undefined) && (missing1 = "valid_days"))) || ((data4.coverage === undefined) && (missing1 = "coverage"))){
validate24.errors = [{instancePath:instancePath+"/years/" + i0,schemaPath:"#/components/schemas/Coverage/required",keyword:"required",params:{missingProperty: missing1},message:"must have required property '"+missing1+"'"}];
return false;
}
else {
const _errs13 = errors;
for(const key1 in data4){
if(!((((key1 === "year") || (key1 === "expected_days")) || (key1 === "valid_days")) || (key1 === "coverage"))){
validate24.errors = [{instancePath:instancePath+"/years/" + i0,schemaPath:"#/components/schemas/Coverage/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs13 === errors){
if(data4.year !== undefined){
let data5 = data4.year;
const _errs14 = errors;
if(!(((typeof data5 == "number") && (!(data5 % 1) && !isNaN(data5))) && (isFinite(data5)))){
validate24.errors = [{instancePath:instancePath+"/years/" + i0+"/year",schemaPath:"#/components/schemas/Coverage/properties/year/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid3 = _errs14 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data4.expected_days !== undefined){
let data6 = data4.expected_days;
const _errs16 = errors;
if(!(((typeof data6 == "number") && (!(data6 % 1) && !isNaN(data6))) && (isFinite(data6)))){
validate24.errors = [{instancePath:instancePath+"/years/" + i0+"/expected_days",schemaPath:"#/components/schemas/Coverage/properties/expected_days/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid3 = _errs16 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data4.valid_days !== undefined){
let data7 = data4.valid_days;
const _errs18 = errors;
if(!(((typeof data7 == "number") && (!(data7 % 1) && !isNaN(data7))) && (isFinite(data7)))){
validate24.errors = [{instancePath:instancePath+"/years/" + i0+"/valid_days",schemaPath:"#/components/schemas/Coverage/properties/valid_days/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid3 = _errs18 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data4.coverage !== undefined){
let data8 = data4.coverage;
const _errs20 = errors;
if(!((typeof data8 == "number") && (isFinite(data8)))){
validate24.errors = [{instancePath:instancePath+"/years/" + i0+"/coverage",schemaPath:"#/components/schemas/Coverage/properties/coverage/type",keyword:"type",params:{type: "number"},message:"must be number"}];
return false;
}
var valid3 = _errs20 === errors;
}
else {
var valid3 = true;
}
}
}
}
}
}
}
else {
validate24.errors = [{instancePath:instancePath+"/years/" + i0,schemaPath:"#/components/schemas/Coverage/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid1 = _errs10 === errors;
if(!valid1){
break;
}
}
}
else {
validate24.errors = [{instancePath:instancePath+"/years",schemaPath:"#/properties/years/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
else {
validate24.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate24.errors = vErrors;
return errors === 0;
}
validate24.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate23(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate23.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((((((((((((data.baseline_start_year === undefined) && (missing0 = "baseline_start_year")) || ((data.baseline_end_year === undefined) && (missing0 = "baseline_end_year"))) || ((data.percentile === undefined) && (missing0 = "percentile"))) || ((data.percentile_method === undefined) && (missing0 = "percentile_method"))) || ((data.threshold_method_version === undefined) && (missing0 = "threshold_method_version"))) || ((data.threshold_celsius === undefined) && (missing0 = "threshold_celsius"))) || ((data.temperature_variable === undefined) && (missing0 = "temperature_variable"))) || ((data.temperature_unit === undefined) && (missing0 = "temperature_unit"))) || ((data.comparison === undefined) && (missing0 = "comparison"))) || ((data.minimum_coverage === undefined) && (missing0 = "minimum_coverage"))) || ((data.seasonal_adjustment === undefined) && (missing0 = "seasonal_adjustment"))) || ((data.limitation === undefined) && (missing0 = "limitation"))) || ((data.baseline_quality === undefined) && (missing0 = "baseline_quality"))) || ((data.method_version === undefined) && (missing0 = "method_version"))) || ((data.minimum_run_days === undefined) && (missing0 = "minimum_run_days"))){
validate23.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(func1.call(schema36.properties, key0))){
validate23.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.baseline_start_year !== undefined){
let data0 = data.baseline_start_year;
const _errs2 = errors;
if(!(((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0))) && (isFinite(data0)))){
validate23.errors = [{instancePath:instancePath+"/baseline_start_year",schemaPath:"#/properties/baseline_start_year/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.baseline_end_year !== undefined){
let data1 = data.baseline_end_year;
const _errs4 = errors;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
validate23.errors = [{instancePath:instancePath+"/baseline_end_year",schemaPath:"#/properties/baseline_end_year/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.percentile !== undefined){
let data2 = data.percentile;
const _errs6 = errors;
if(!(((typeof data2 == "number") && (!(data2 % 1) && !isNaN(data2))) && (isFinite(data2)))){
validate23.errors = [{instancePath:instancePath+"/percentile",schemaPath:"#/properties/percentile/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.percentile_method !== undefined){
let data3 = data.percentile_method;
const _errs8 = errors;
if(typeof data3 !== "string"){
validate23.errors = [{instancePath:instancePath+"/percentile_method",schemaPath:"#/properties/percentile_method/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if("linear" !== data3){
validate23.errors = [{instancePath:instancePath+"/percentile_method",schemaPath:"#/properties/percentile_method/const",keyword:"const",params:{allowedValue: "linear"},message:"must be equal to constant"}];
return false;
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.threshold_method_version !== undefined){
const _errs10 = errors;
if(typeof data.threshold_method_version !== "string"){
validate23.errors = [{instancePath:instancePath+"/threshold_method_version",schemaPath:"#/properties/threshold_method_version/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs10 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.threshold_celsius !== undefined){
let data5 = data.threshold_celsius;
const _errs12 = errors;
if(!((typeof data5 == "number") && (isFinite(data5)))){
validate23.errors = [{instancePath:instancePath+"/threshold_celsius",schemaPath:"#/properties/threshold_celsius/type",keyword:"type",params:{type: "number"},message:"must be number"}];
return false;
}
var valid0 = _errs12 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.temperature_variable !== undefined){
let data6 = data.temperature_variable;
const _errs14 = errors;
if(typeof data6 !== "string"){
validate23.errors = [{instancePath:instancePath+"/temperature_variable",schemaPath:"#/properties/temperature_variable/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if("temperature_2m_max" !== data6){
validate23.errors = [{instancePath:instancePath+"/temperature_variable",schemaPath:"#/properties/temperature_variable/const",keyword:"const",params:{allowedValue: "temperature_2m_max"},message:"must be equal to constant"}];
return false;
}
var valid0 = _errs14 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.temperature_unit !== undefined){
const _errs16 = errors;
if(typeof data.temperature_unit !== "string"){
validate23.errors = [{instancePath:instancePath+"/temperature_unit",schemaPath:"#/properties/temperature_unit/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs16 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.comparison !== undefined){
let data8 = data.comparison;
const _errs18 = errors;
if(typeof data8 !== "string"){
validate23.errors = [{instancePath:instancePath+"/comparison",schemaPath:"#/properties/comparison/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(">" !== data8){
validate23.errors = [{instancePath:instancePath+"/comparison",schemaPath:"#/properties/comparison/const",keyword:"const",params:{allowedValue: ">"},message:"must be equal to constant"}];
return false;
}
var valid0 = _errs18 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.minimum_coverage !== undefined){
let data9 = data.minimum_coverage;
const _errs20 = errors;
if(!((typeof data9 == "number") && (isFinite(data9)))){
validate23.errors = [{instancePath:instancePath+"/minimum_coverage",schemaPath:"#/properties/minimum_coverage/type",keyword:"type",params:{type: "number"},message:"must be number"}];
return false;
}
var valid0 = _errs20 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.seasonal_adjustment !== undefined){
let data10 = data.seasonal_adjustment;
const _errs22 = errors;
if(typeof data10 !== "boolean"){
validate23.errors = [{instancePath:instancePath+"/seasonal_adjustment",schemaPath:"#/properties/seasonal_adjustment/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"}];
return false;
}
if(false !== data10){
validate23.errors = [{instancePath:instancePath+"/seasonal_adjustment",schemaPath:"#/properties/seasonal_adjustment/const",keyword:"const",params:{allowedValue: false},message:"must be equal to constant"}];
return false;
}
var valid0 = _errs22 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.limitation !== undefined){
const _errs24 = errors;
if(typeof data.limitation !== "string"){
validate23.errors = [{instancePath:instancePath+"/limitation",schemaPath:"#/properties/limitation/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs24 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.baseline_quality !== undefined){
const _errs26 = errors;
if(!(validate24(data.baseline_quality, {instancePath:instancePath+"/baseline_quality",parentData:data,parentDataProperty:"baseline_quality",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate24.errors : vErrors.concat(validate24.errors);
errors = vErrors.length;
}
var valid0 = _errs26 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.method_version !== undefined){
const _errs27 = errors;
if(typeof data.method_version !== "string"){
validate23.errors = [{instancePath:instancePath+"/method_version",schemaPath:"#/properties/method_version/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs27 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.minimum_run_days !== undefined){
let data14 = data.minimum_run_days;
const _errs29 = errors;
if(!(((typeof data14 == "number") && (!(data14 % 1) && !isNaN(data14))) && (isFinite(data14)))){
validate23.errors = [{instancePath:instancePath+"/minimum_run_days",schemaPath:"#/properties/minimum_run_days/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(3 !== data14){
validate23.errors = [{instancePath:instancePath+"/minimum_run_days",schemaPath:"#/properties/minimum_run_days/const",keyword:"const",params:{allowedValue: 3},message:"must be equal to constant"}];
return false;
}
var valid0 = _errs29 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
else {
validate23.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate23.errors = vErrors;
return errors === 0;
}
validate23.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema41 = {"properties":{"regression":{"$ref":"#/components/schemas/Regression"},"comparison":{"$ref":"#/components/schemas/Comparison"}},"additionalProperties":false,"type":"object","required":["regression","comparison"],"title":"Trend"};
const schema42 = {"properties":{"slope_events_per_decade":{"anyOf":[{"type":"number"},{"type":"null"}],"title":"Slope Events Per Decade"},"fit_year_count":{"type":"integer","title":"Fit Year Count"},"fit_years":{"items":{"type":"integer"},"type":"array","title":"Fit Years"},"reason":{"anyOf":[{"type":"string"},{"type":"null"}],"title":"Reason"},"interpretation":{"type":"string","title":"Interpretation"}},"additionalProperties":false,"type":"object","required":["slope_events_per_decade","fit_year_count","fit_years","reason","interpretation"],"title":"Regression"};
const schema43 = {"properties":{"first_window":{"anyOf":[{"$ref":"#/components/schemas/ComparisonWindow"},{"type":"null"}]},"last_window":{"anyOf":[{"$ref":"#/components/schemas/ComparisonWindow"},{"type":"null"}]},"absolute_change_events_per_year":{"anyOf":[{"type":"number"},{"type":"null"}],"title":"Absolute Change Events Per Year"},"percent_change":{"anyOf":[{"type":"number"},{"type":"null"}],"title":"Percent Change"},"reason":{"anyOf":[{"type":"string"},{"type":"null"}],"title":"Reason"},"percentage_unavailable_reason":{"anyOf":[{"type":"string"},{"type":"null"}],"title":"Percentage Unavailable Reason"}},"additionalProperties":false,"type":"object","required":["first_window","last_window","absolute_change_events_per_year","percent_change","reason","percentage_unavailable_reason"],"title":"Comparison"};
const schema44 = {"properties":{"start_year":{"type":"integer","title":"Start Year"},"end_year":{"type":"integer","title":"End Year"},"mean_event_count":{"type":"number","title":"Mean Event Count"}},"additionalProperties":false,"type":"object","required":["start_year","end_year","mean_event_count"],"title":"ComparisonWindow"};

function validate28(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate28.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((((((data.first_window === undefined) && (missing0 = "first_window")) || ((data.last_window === undefined) && (missing0 = "last_window"))) || ((data.absolute_change_events_per_year === undefined) && (missing0 = "absolute_change_events_per_year"))) || ((data.percent_change === undefined) && (missing0 = "percent_change"))) || ((data.reason === undefined) && (missing0 = "reason"))) || ((data.percentage_unavailable_reason === undefined) && (missing0 = "percentage_unavailable_reason"))){
validate28.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((((((key0 === "first_window") || (key0 === "last_window")) || (key0 === "absolute_change_events_per_year")) || (key0 === "percent_change")) || (key0 === "reason")) || (key0 === "percentage_unavailable_reason"))){
validate28.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.first_window !== undefined){
let data0 = data.first_window;
const _errs2 = errors;
const _errs3 = errors;
let valid1 = false;
const _errs4 = errors;
const _errs5 = errors;
if(errors === _errs5){
if(data0 && typeof data0 == "object" && !Array.isArray(data0)){
let missing1;
if((((data0.start_year === undefined) && (missing1 = "start_year")) || ((data0.end_year === undefined) && (missing1 = "end_year"))) || ((data0.mean_event_count === undefined) && (missing1 = "mean_event_count"))){
const err0 = {instancePath:instancePath+"/first_window",schemaPath:"#/components/schemas/ComparisonWindow/required",keyword:"required",params:{missingProperty: missing1},message:"must have required property '"+missing1+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
else {
const _errs7 = errors;
for(const key1 in data0){
if(!(((key1 === "start_year") || (key1 === "end_year")) || (key1 === "mean_event_count"))){
const err1 = {instancePath:instancePath+"/first_window",schemaPath:"#/components/schemas/ComparisonWindow/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
break;
}
}
if(_errs7 === errors){
if(data0.start_year !== undefined){
let data1 = data0.start_year;
const _errs8 = errors;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err2 = {instancePath:instancePath+"/first_window/start_year",schemaPath:"#/components/schemas/ComparisonWindow/properties/start_year/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
var valid3 = _errs8 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data0.end_year !== undefined){
let data2 = data0.end_year;
const _errs10 = errors;
if(!(((typeof data2 == "number") && (!(data2 % 1) && !isNaN(data2))) && (isFinite(data2)))){
const err3 = {instancePath:instancePath+"/first_window/end_year",schemaPath:"#/components/schemas/ComparisonWindow/properties/end_year/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
var valid3 = _errs10 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data0.mean_event_count !== undefined){
let data3 = data0.mean_event_count;
const _errs12 = errors;
if(!((typeof data3 == "number") && (isFinite(data3)))){
const err4 = {instancePath:instancePath+"/first_window/mean_event_count",schemaPath:"#/components/schemas/ComparisonWindow/properties/mean_event_count/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
var valid3 = _errs12 === errors;
}
else {
var valid3 = true;
}
}
}
}
}
}
else {
const err5 = {instancePath:instancePath+"/first_window",schemaPath:"#/components/schemas/ComparisonWindow/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
var _valid0 = _errs4 === errors;
valid1 = valid1 || _valid0;
const _errs14 = errors;
if(data0 !== null){
const err6 = {instancePath:instancePath+"/first_window",schemaPath:"#/properties/first_window/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
var _valid0 = _errs14 === errors;
valid1 = valid1 || _valid0;
if(!valid1){
const err7 = {instancePath:instancePath+"/first_window",schemaPath:"#/properties/first_window/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
validate28.errors = vErrors;
return false;
}
else {
errors = _errs3;
if(vErrors !== null){
if(_errs3){
vErrors.length = _errs3;
}
else {
vErrors = null;
}
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.last_window !== undefined){
let data4 = data.last_window;
const _errs16 = errors;
const _errs17 = errors;
let valid4 = false;
const _errs18 = errors;
const _errs19 = errors;
if(errors === _errs19){
if(data4 && typeof data4 == "object" && !Array.isArray(data4)){
let missing2;
if((((data4.start_year === undefined) && (missing2 = "start_year")) || ((data4.end_year === undefined) && (missing2 = "end_year"))) || ((data4.mean_event_count === undefined) && (missing2 = "mean_event_count"))){
const err8 = {instancePath:instancePath+"/last_window",schemaPath:"#/components/schemas/ComparisonWindow/required",keyword:"required",params:{missingProperty: missing2},message:"must have required property '"+missing2+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
else {
const _errs21 = errors;
for(const key2 in data4){
if(!(((key2 === "start_year") || (key2 === "end_year")) || (key2 === "mean_event_count"))){
const err9 = {instancePath:instancePath+"/last_window",schemaPath:"#/components/schemas/ComparisonWindow/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
break;
}
}
if(_errs21 === errors){
if(data4.start_year !== undefined){
let data5 = data4.start_year;
const _errs22 = errors;
if(!(((typeof data5 == "number") && (!(data5 % 1) && !isNaN(data5))) && (isFinite(data5)))){
const err10 = {instancePath:instancePath+"/last_window/start_year",schemaPath:"#/components/schemas/ComparisonWindow/properties/start_year/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
var valid6 = _errs22 === errors;
}
else {
var valid6 = true;
}
if(valid6){
if(data4.end_year !== undefined){
let data6 = data4.end_year;
const _errs24 = errors;
if(!(((typeof data6 == "number") && (!(data6 % 1) && !isNaN(data6))) && (isFinite(data6)))){
const err11 = {instancePath:instancePath+"/last_window/end_year",schemaPath:"#/components/schemas/ComparisonWindow/properties/end_year/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
var valid6 = _errs24 === errors;
}
else {
var valid6 = true;
}
if(valid6){
if(data4.mean_event_count !== undefined){
let data7 = data4.mean_event_count;
const _errs26 = errors;
if(!((typeof data7 == "number") && (isFinite(data7)))){
const err12 = {instancePath:instancePath+"/last_window/mean_event_count",schemaPath:"#/components/schemas/ComparisonWindow/properties/mean_event_count/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
var valid6 = _errs26 === errors;
}
else {
var valid6 = true;
}
}
}
}
}
}
else {
const err13 = {instancePath:instancePath+"/last_window",schemaPath:"#/components/schemas/ComparisonWindow/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
var _valid1 = _errs18 === errors;
valid4 = valid4 || _valid1;
const _errs28 = errors;
if(data4 !== null){
const err14 = {instancePath:instancePath+"/last_window",schemaPath:"#/properties/last_window/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
var _valid1 = _errs28 === errors;
valid4 = valid4 || _valid1;
if(!valid4){
const err15 = {instancePath:instancePath+"/last_window",schemaPath:"#/properties/last_window/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
validate28.errors = vErrors;
return false;
}
else {
errors = _errs17;
if(vErrors !== null){
if(_errs17){
vErrors.length = _errs17;
}
else {
vErrors = null;
}
}
}
var valid0 = _errs16 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.absolute_change_events_per_year !== undefined){
let data8 = data.absolute_change_events_per_year;
const _errs30 = errors;
const _errs31 = errors;
let valid7 = false;
const _errs32 = errors;
if(!((typeof data8 == "number") && (isFinite(data8)))){
const err16 = {instancePath:instancePath+"/absolute_change_events_per_year",schemaPath:"#/properties/absolute_change_events_per_year/anyOf/0/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
var _valid2 = _errs32 === errors;
valid7 = valid7 || _valid2;
const _errs34 = errors;
if(data8 !== null){
const err17 = {instancePath:instancePath+"/absolute_change_events_per_year",schemaPath:"#/properties/absolute_change_events_per_year/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
var _valid2 = _errs34 === errors;
valid7 = valid7 || _valid2;
if(!valid7){
const err18 = {instancePath:instancePath+"/absolute_change_events_per_year",schemaPath:"#/properties/absolute_change_events_per_year/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
validate28.errors = vErrors;
return false;
}
else {
errors = _errs31;
if(vErrors !== null){
if(_errs31){
vErrors.length = _errs31;
}
else {
vErrors = null;
}
}
}
var valid0 = _errs30 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.percent_change !== undefined){
let data9 = data.percent_change;
const _errs36 = errors;
const _errs37 = errors;
let valid8 = false;
const _errs38 = errors;
if(!((typeof data9 == "number") && (isFinite(data9)))){
const err19 = {instancePath:instancePath+"/percent_change",schemaPath:"#/properties/percent_change/anyOf/0/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
var _valid3 = _errs38 === errors;
valid8 = valid8 || _valid3;
const _errs40 = errors;
if(data9 !== null){
const err20 = {instancePath:instancePath+"/percent_change",schemaPath:"#/properties/percent_change/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
var _valid3 = _errs40 === errors;
valid8 = valid8 || _valid3;
if(!valid8){
const err21 = {instancePath:instancePath+"/percent_change",schemaPath:"#/properties/percent_change/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
validate28.errors = vErrors;
return false;
}
else {
errors = _errs37;
if(vErrors !== null){
if(_errs37){
vErrors.length = _errs37;
}
else {
vErrors = null;
}
}
}
var valid0 = _errs36 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.reason !== undefined){
let data10 = data.reason;
const _errs42 = errors;
const _errs43 = errors;
let valid9 = false;
const _errs44 = errors;
if(typeof data10 !== "string"){
const err22 = {instancePath:instancePath+"/reason",schemaPath:"#/properties/reason/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
var _valid4 = _errs44 === errors;
valid9 = valid9 || _valid4;
const _errs46 = errors;
if(data10 !== null){
const err23 = {instancePath:instancePath+"/reason",schemaPath:"#/properties/reason/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
var _valid4 = _errs46 === errors;
valid9 = valid9 || _valid4;
if(!valid9){
const err24 = {instancePath:instancePath+"/reason",schemaPath:"#/properties/reason/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
validate28.errors = vErrors;
return false;
}
else {
errors = _errs43;
if(vErrors !== null){
if(_errs43){
vErrors.length = _errs43;
}
else {
vErrors = null;
}
}
}
var valid0 = _errs42 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.percentage_unavailable_reason !== undefined){
let data11 = data.percentage_unavailable_reason;
const _errs48 = errors;
const _errs49 = errors;
let valid10 = false;
const _errs50 = errors;
if(typeof data11 !== "string"){
const err25 = {instancePath:instancePath+"/percentage_unavailable_reason",schemaPath:"#/properties/percentage_unavailable_reason/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
var _valid5 = _errs50 === errors;
valid10 = valid10 || _valid5;
const _errs52 = errors;
if(data11 !== null){
const err26 = {instancePath:instancePath+"/percentage_unavailable_reason",schemaPath:"#/properties/percentage_unavailable_reason/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
var _valid5 = _errs52 === errors;
valid10 = valid10 || _valid5;
if(!valid10){
const err27 = {instancePath:instancePath+"/percentage_unavailable_reason",schemaPath:"#/properties/percentage_unavailable_reason/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
validate28.errors = vErrors;
return false;
}
else {
errors = _errs49;
if(vErrors !== null){
if(_errs49){
vErrors.length = _errs49;
}
else {
vErrors = null;
}
}
}
var valid0 = _errs48 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
else {
validate28.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate28.errors = vErrors;
return errors === 0;
}
validate28.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate27(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate27.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((data.regression === undefined) && (missing0 = "regression")) || ((data.comparison === undefined) && (missing0 = "comparison"))){
validate27.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((key0 === "regression") || (key0 === "comparison"))){
validate27.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.regression !== undefined){
let data0 = data.regression;
const _errs2 = errors;
const _errs3 = errors;
if(errors === _errs3){
if(data0 && typeof data0 == "object" && !Array.isArray(data0)){
let missing1;
if((((((data0.slope_events_per_decade === undefined) && (missing1 = "slope_events_per_decade")) || ((data0.fit_year_count === undefined) && (missing1 = "fit_year_count"))) || ((data0.fit_years === undefined) && (missing1 = "fit_years"))) || ((data0.reason === undefined) && (missing1 = "reason"))) || ((data0.interpretation === undefined) && (missing1 = "interpretation"))){
validate27.errors = [{instancePath:instancePath+"/regression",schemaPath:"#/components/schemas/Regression/required",keyword:"required",params:{missingProperty: missing1},message:"must have required property '"+missing1+"'"}];
return false;
}
else {
const _errs5 = errors;
for(const key1 in data0){
if(!(((((key1 === "slope_events_per_decade") || (key1 === "fit_year_count")) || (key1 === "fit_years")) || (key1 === "reason")) || (key1 === "interpretation"))){
validate27.errors = [{instancePath:instancePath+"/regression",schemaPath:"#/components/schemas/Regression/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs5 === errors){
if(data0.slope_events_per_decade !== undefined){
let data1 = data0.slope_events_per_decade;
const _errs6 = errors;
const _errs7 = errors;
let valid3 = false;
const _errs8 = errors;
if(!((typeof data1 == "number") && (isFinite(data1)))){
const err0 = {instancePath:instancePath+"/regression/slope_events_per_decade",schemaPath:"#/components/schemas/Regression/properties/slope_events_per_decade/anyOf/0/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
var _valid0 = _errs8 === errors;
valid3 = valid3 || _valid0;
const _errs10 = errors;
if(data1 !== null){
const err1 = {instancePath:instancePath+"/regression/slope_events_per_decade",schemaPath:"#/components/schemas/Regression/properties/slope_events_per_decade/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
var _valid0 = _errs10 === errors;
valid3 = valid3 || _valid0;
if(!valid3){
const err2 = {instancePath:instancePath+"/regression/slope_events_per_decade",schemaPath:"#/components/schemas/Regression/properties/slope_events_per_decade/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
validate27.errors = vErrors;
return false;
}
else {
errors = _errs7;
if(vErrors !== null){
if(_errs7){
vErrors.length = _errs7;
}
else {
vErrors = null;
}
}
}
var valid2 = _errs6 === errors;
}
else {
var valid2 = true;
}
if(valid2){
if(data0.fit_year_count !== undefined){
let data2 = data0.fit_year_count;
const _errs12 = errors;
if(!(((typeof data2 == "number") && (!(data2 % 1) && !isNaN(data2))) && (isFinite(data2)))){
validate27.errors = [{instancePath:instancePath+"/regression/fit_year_count",schemaPath:"#/components/schemas/Regression/properties/fit_year_count/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid2 = _errs12 === errors;
}
else {
var valid2 = true;
}
if(valid2){
if(data0.fit_years !== undefined){
let data3 = data0.fit_years;
const _errs14 = errors;
if(errors === _errs14){
if(Array.isArray(data3)){
var valid4 = true;
const len0 = data3.length;
for(let i0=0; i0<len0; i0++){
let data4 = data3[i0];
const _errs16 = errors;
if(!(((typeof data4 == "number") && (!(data4 % 1) && !isNaN(data4))) && (isFinite(data4)))){
validate27.errors = [{instancePath:instancePath+"/regression/fit_years/" + i0,schemaPath:"#/components/schemas/Regression/properties/fit_years/items/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid4 = _errs16 === errors;
if(!valid4){
break;
}
}
}
else {
validate27.errors = [{instancePath:instancePath+"/regression/fit_years",schemaPath:"#/components/schemas/Regression/properties/fit_years/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid2 = _errs14 === errors;
}
else {
var valid2 = true;
}
if(valid2){
if(data0.reason !== undefined){
let data5 = data0.reason;
const _errs18 = errors;
const _errs19 = errors;
let valid5 = false;
const _errs20 = errors;
if(typeof data5 !== "string"){
const err3 = {instancePath:instancePath+"/regression/reason",schemaPath:"#/components/schemas/Regression/properties/reason/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
var _valid1 = _errs20 === errors;
valid5 = valid5 || _valid1;
const _errs22 = errors;
if(data5 !== null){
const err4 = {instancePath:instancePath+"/regression/reason",schemaPath:"#/components/schemas/Regression/properties/reason/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
var _valid1 = _errs22 === errors;
valid5 = valid5 || _valid1;
if(!valid5){
const err5 = {instancePath:instancePath+"/regression/reason",schemaPath:"#/components/schemas/Regression/properties/reason/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
validate27.errors = vErrors;
return false;
}
else {
errors = _errs19;
if(vErrors !== null){
if(_errs19){
vErrors.length = _errs19;
}
else {
vErrors = null;
}
}
}
var valid2 = _errs18 === errors;
}
else {
var valid2 = true;
}
if(valid2){
if(data0.interpretation !== undefined){
const _errs24 = errors;
if(typeof data0.interpretation !== "string"){
validate27.errors = [{instancePath:instancePath+"/regression/interpretation",schemaPath:"#/components/schemas/Regression/properties/interpretation/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid2 = _errs24 === errors;
}
else {
var valid2 = true;
}
}
}
}
}
}
}
}
else {
validate27.errors = [{instancePath:instancePath+"/regression",schemaPath:"#/components/schemas/Regression/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.comparison !== undefined){
const _errs26 = errors;
if(!(validate28(data.comparison, {instancePath:instancePath+"/comparison",parentData:data,parentDataProperty:"comparison",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate28.errors : vErrors.concat(validate28.errors);
errors = vErrors.length;
}
var valid0 = _errs26 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
else {
validate27.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate27.errors = vErrors;
return errors === 0;
}
validate27.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema47 = {"properties":{"warnings":{"items":{"type":"string"},"type":"array","title":"Warnings"},"incomplete_years":{"items":{"type":"integer"},"type":"array","title":"Incomplete Years"},"excluded_boundary_events":{"items":{"$ref":"#/components/schemas/Event"},"type":"array","title":"Excluded Boundary Events"},"counting_metadata":{"$ref":"#/components/schemas/CountingMetadata"}},"additionalProperties":false,"type":"object","required":["warnings","incomplete_years","excluded_boundary_events","counting_metadata"],"title":"DataQuality"};
const schema49 = {"properties":{"event_count":{"type":"string","title":"Event Count"},"duration":{"type":"string","title":"Duration"},"heatwave_days":{"type":"string","title":"Heatwave Days"},"intensity":{"type":"string","title":"Intensity"},"peak":{"type":"string","title":"Peak"},"boundary_policy":{"type":"string","title":"Boundary Policy"},"units":{"additionalProperties":{"type":"string"},"type":"object","title":"Units"}},"additionalProperties":false,"type":"object","required":["event_count","duration","heatwave_days","intensity","peak","boundary_policy","units"],"title":"CountingMetadata"};
const formats0 = formatModule.fullFormats.date;

function validate31(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate31.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((((data.warnings === undefined) && (missing0 = "warnings")) || ((data.incomplete_years === undefined) && (missing0 = "incomplete_years"))) || ((data.excluded_boundary_events === undefined) && (missing0 = "excluded_boundary_events"))) || ((data.counting_metadata === undefined) && (missing0 = "counting_metadata"))){
validate31.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((((key0 === "warnings") || (key0 === "incomplete_years")) || (key0 === "excluded_boundary_events")) || (key0 === "counting_metadata"))){
validate31.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.warnings !== undefined){
let data0 = data.warnings;
const _errs2 = errors;
if(errors === _errs2){
if(Array.isArray(data0)){
var valid1 = true;
const len0 = data0.length;
for(let i0=0; i0<len0; i0++){
const _errs4 = errors;
if(typeof data0[i0] !== "string"){
validate31.errors = [{instancePath:instancePath+"/warnings/" + i0,schemaPath:"#/properties/warnings/items/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid1 = _errs4 === errors;
if(!valid1){
break;
}
}
}
else {
validate31.errors = [{instancePath:instancePath+"/warnings",schemaPath:"#/properties/warnings/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.incomplete_years !== undefined){
let data2 = data.incomplete_years;
const _errs6 = errors;
if(errors === _errs6){
if(Array.isArray(data2)){
var valid2 = true;
const len1 = data2.length;
for(let i1=0; i1<len1; i1++){
let data3 = data2[i1];
const _errs8 = errors;
if(!(((typeof data3 == "number") && (!(data3 % 1) && !isNaN(data3))) && (isFinite(data3)))){
validate31.errors = [{instancePath:instancePath+"/incomplete_years/" + i1,schemaPath:"#/properties/incomplete_years/items/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid2 = _errs8 === errors;
if(!valid2){
break;
}
}
}
else {
validate31.errors = [{instancePath:instancePath+"/incomplete_years",schemaPath:"#/properties/incomplete_years/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.excluded_boundary_events !== undefined){
let data4 = data.excluded_boundary_events;
const _errs10 = errors;
if(errors === _errs10){
if(Array.isArray(data4)){
var valid3 = true;
const len2 = data4.length;
for(let i2=0; i2<len2; i2++){
let data5 = data4[i2];
const _errs12 = errors;
const _errs13 = errors;
if(errors === _errs13){
if(data5 && typeof data5 == "object" && !Array.isArray(data5)){
let missing1;
if((((((((((((((((data5.observed_start_date === undefined) && (missing1 = "observed_start_date")) || ((data5.observed_end_date === undefined) && (missing1 = "observed_end_date"))) || ((data5.observed_duration_days === undefined) && (missing1 = "observed_duration_days"))) || ((data5.start_date === undefined) && (missing1 = "start_date"))) || ((data5.end_date === undefined) && (missing1 = "end_date"))) || ((data5.duration_days === undefined) && (missing1 = "duration_days"))) || ((data5.peak_temperature_celsius === undefined) && (missing1 = "peak_temperature_celsius"))) || ((data5.mean_exceedance_celsius === undefined) && (missing1 = "mean_exceedance_celsius"))) || ((data5.observed_peak_temperature_celsius === undefined) && (missing1 = "observed_peak_temperature_celsius"))) || ((data5.observed_mean_exceedance_celsius === undefined) && (missing1 = "observed_mean_exceedance_celsius"))) || ((data5.truncated_start === undefined) && (missing1 = "truncated_start"))) || ((data5.truncated_end === undefined) && (missing1 = "truncated_end"))) || ((data5.qualification_confirmed === undefined) && (missing1 = "qualification_confirmed"))) || ((data5.started_in_selection === undefined) && (missing1 = "started_in_selection"))) || ((data5.eligible_for_complete_metrics === undefined) && (missing1 = "eligible_for_complete_metrics"))){
validate31.errors = [{instancePath:instancePath+"/excluded_boundary_events/" + i2,schemaPath:"#/components/schemas/Event/required",keyword:"required",params:{missingProperty: missing1},message:"must have required property '"+missing1+"'"}];
return false;
}
else {
const _errs15 = errors;
for(const key1 in data5){
if(!(func1.call(schema46.properties, key1))){
validate31.errors = [{instancePath:instancePath+"/excluded_boundary_events/" + i2,schemaPath:"#/components/schemas/Event/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs15 === errors){
if(data5.observed_start_date !== undefined){
let data6 = data5.observed_start_date;
const _errs16 = errors;
if(errors === _errs16){
if(errors === _errs16){
if(typeof data6 === "string"){
if(!(formats0.validate(data6))){
validate31.errors = [{instancePath:instancePath+"/excluded_boundary_events/" + i2+"/observed_start_date",schemaPath:"#/components/schemas/Event/properties/observed_start_date/format",keyword:"format",params:{format: "date"},message:"must match format \""+"date"+"\""}];
return false;
}
}
else {
validate31.errors = [{instancePath:instancePath+"/excluded_boundary_events/" + i2+"/observed_start_date",schemaPath:"#/components/schemas/Event/properties/observed_start_date/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid5 = _errs16 === errors;
}
else {
var valid5 = true;
}
if(valid5){
if(data5.observed_end_date !== undefined){
let data7 = data5.observed_end_date;
const _errs18 = errors;
if(errors === _errs18){
if(errors === _errs18){
if(typeof data7 === "string"){
if(!(formats0.validate(data7))){
validate31.errors = [{instancePath:instancePath+"/excluded_boundary_events/" + i2+"/observed_end_date",schemaPath:"#/components/schemas/Event/properties/observed_end_date/format",keyword:"format",params:{format: "date"},message:"must match format \""+"date"+"\""}];
return false;
}
}
else {
validate31.errors = [{instancePath:instancePath+"/excluded_boundary_events/" + i2+"/observed_end_date",schemaPath:"#/components/schemas/Event/properties/observed_end_date/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid5 = _errs18 === errors;
}
else {
var valid5 = true;
}
if(valid5){
if(data5.observed_duration_days !== undefined){
let data8 = data5.observed_duration_days;
const _errs20 = errors;
if(!(((typeof data8 == "number") && (!(data8 % 1) && !isNaN(data8))) && (isFinite(data8)))){
validate31.errors = [{instancePath:instancePath+"/excluded_boundary_events/" + i2+"/observed_duration_days",schemaPath:"#/components/schemas/Event/properties/observed_duration_days/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid5 = _errs20 === errors;
}
else {
var valid5 = true;
}
if(valid5){
if(data5.start_date !== undefined){
let data9 = data5.start_date;
const _errs22 = errors;
const _errs23 = errors;
let valid6 = false;
const _errs24 = errors;
if(errors === _errs24){
if(errors === _errs24){
if(typeof data9 === "string"){
if(!(formats0.validate(data9))){
const err0 = {instancePath:instancePath+"/excluded_boundary_events/" + i2+"/start_date",schemaPath:"#/components/schemas/Event/properties/start_date/anyOf/0/format",keyword:"format",params:{format: "date"},message:"must match format \""+"date"+"\""};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
}
else {
const err1 = {instancePath:instancePath+"/excluded_boundary_events/" + i2+"/start_date",schemaPath:"#/components/schemas/Event/properties/start_date/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
}
var _valid0 = _errs24 === errors;
valid6 = valid6 || _valid0;
const _errs26 = errors;
if(data9 !== null){
const err2 = {instancePath:instancePath+"/excluded_boundary_events/" + i2+"/start_date",schemaPath:"#/components/schemas/Event/properties/start_date/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
var _valid0 = _errs26 === errors;
valid6 = valid6 || _valid0;
if(!valid6){
const err3 = {instancePath:instancePath+"/excluded_boundary_events/" + i2+"/start_date",schemaPath:"#/components/schemas/Event/properties/start_date/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
validate31.errors = vErrors;
return false;
}
else {
errors = _errs23;
if(vErrors !== null){
if(_errs23){
vErrors.length = _errs23;
}
else {
vErrors = null;
}
}
}
var valid5 = _errs22 === errors;
}
else {
var valid5 = true;
}
if(valid5){
if(data5.end_date !== undefined){
let data10 = data5.end_date;
const _errs28 = errors;
const _errs29 = errors;
let valid7 = false;
const _errs30 = errors;
if(errors === _errs30){
if(errors === _errs30){
if(typeof data10 === "string"){
if(!(formats0.validate(data10))){
const err4 = {instancePath:instancePath+"/excluded_boundary_events/" + i2+"/end_date",schemaPath:"#/components/schemas/Event/properties/end_date/anyOf/0/format",keyword:"format",params:{format: "date"},message:"must match format \""+"date"+"\""};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
else {
const err5 = {instancePath:instancePath+"/excluded_boundary_events/" + i2+"/end_date",schemaPath:"#/components/schemas/Event/properties/end_date/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
}
var _valid1 = _errs30 === errors;
valid7 = valid7 || _valid1;
const _errs32 = errors;
if(data10 !== null){
const err6 = {instancePath:instancePath+"/excluded_boundary_events/" + i2+"/end_date",schemaPath:"#/components/schemas/Event/properties/end_date/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
var _valid1 = _errs32 === errors;
valid7 = valid7 || _valid1;
if(!valid7){
const err7 = {instancePath:instancePath+"/excluded_boundary_events/" + i2+"/end_date",schemaPath:"#/components/schemas/Event/properties/end_date/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
validate31.errors = vErrors;
return false;
}
else {
errors = _errs29;
if(vErrors !== null){
if(_errs29){
vErrors.length = _errs29;
}
else {
vErrors = null;
}
}
}
var valid5 = _errs28 === errors;
}
else {
var valid5 = true;
}
if(valid5){
if(data5.duration_days !== undefined){
let data11 = data5.duration_days;
const _errs34 = errors;
const _errs35 = errors;
let valid8 = false;
const _errs36 = errors;
if(!(((typeof data11 == "number") && (!(data11 % 1) && !isNaN(data11))) && (isFinite(data11)))){
const err8 = {instancePath:instancePath+"/excluded_boundary_events/" + i2+"/duration_days",schemaPath:"#/components/schemas/Event/properties/duration_days/anyOf/0/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
var _valid2 = _errs36 === errors;
valid8 = valid8 || _valid2;
const _errs38 = errors;
if(data11 !== null){
const err9 = {instancePath:instancePath+"/excluded_boundary_events/" + i2+"/duration_days",schemaPath:"#/components/schemas/Event/properties/duration_days/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
var _valid2 = _errs38 === errors;
valid8 = valid8 || _valid2;
if(!valid8){
const err10 = {instancePath:instancePath+"/excluded_boundary_events/" + i2+"/duration_days",schemaPath:"#/components/schemas/Event/properties/duration_days/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
validate31.errors = vErrors;
return false;
}
else {
errors = _errs35;
if(vErrors !== null){
if(_errs35){
vErrors.length = _errs35;
}
else {
vErrors = null;
}
}
}
var valid5 = _errs34 === errors;
}
else {
var valid5 = true;
}
if(valid5){
if(data5.peak_temperature_celsius !== undefined){
let data12 = data5.peak_temperature_celsius;
const _errs40 = errors;
const _errs41 = errors;
let valid9 = false;
const _errs42 = errors;
if(!((typeof data12 == "number") && (isFinite(data12)))){
const err11 = {instancePath:instancePath+"/excluded_boundary_events/" + i2+"/peak_temperature_celsius",schemaPath:"#/components/schemas/Event/properties/peak_temperature_celsius/anyOf/0/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
var _valid3 = _errs42 === errors;
valid9 = valid9 || _valid3;
const _errs44 = errors;
if(data12 !== null){
const err12 = {instancePath:instancePath+"/excluded_boundary_events/" + i2+"/peak_temperature_celsius",schemaPath:"#/components/schemas/Event/properties/peak_temperature_celsius/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
var _valid3 = _errs44 === errors;
valid9 = valid9 || _valid3;
if(!valid9){
const err13 = {instancePath:instancePath+"/excluded_boundary_events/" + i2+"/peak_temperature_celsius",schemaPath:"#/components/schemas/Event/properties/peak_temperature_celsius/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
validate31.errors = vErrors;
return false;
}
else {
errors = _errs41;
if(vErrors !== null){
if(_errs41){
vErrors.length = _errs41;
}
else {
vErrors = null;
}
}
}
var valid5 = _errs40 === errors;
}
else {
var valid5 = true;
}
if(valid5){
if(data5.mean_exceedance_celsius !== undefined){
let data13 = data5.mean_exceedance_celsius;
const _errs46 = errors;
const _errs47 = errors;
let valid10 = false;
const _errs48 = errors;
if(!((typeof data13 == "number") && (isFinite(data13)))){
const err14 = {instancePath:instancePath+"/excluded_boundary_events/" + i2+"/mean_exceedance_celsius",schemaPath:"#/components/schemas/Event/properties/mean_exceedance_celsius/anyOf/0/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
var _valid4 = _errs48 === errors;
valid10 = valid10 || _valid4;
const _errs50 = errors;
if(data13 !== null){
const err15 = {instancePath:instancePath+"/excluded_boundary_events/" + i2+"/mean_exceedance_celsius",schemaPath:"#/components/schemas/Event/properties/mean_exceedance_celsius/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
var _valid4 = _errs50 === errors;
valid10 = valid10 || _valid4;
if(!valid10){
const err16 = {instancePath:instancePath+"/excluded_boundary_events/" + i2+"/mean_exceedance_celsius",schemaPath:"#/components/schemas/Event/properties/mean_exceedance_celsius/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
validate31.errors = vErrors;
return false;
}
else {
errors = _errs47;
if(vErrors !== null){
if(_errs47){
vErrors.length = _errs47;
}
else {
vErrors = null;
}
}
}
var valid5 = _errs46 === errors;
}
else {
var valid5 = true;
}
if(valid5){
if(data5.observed_peak_temperature_celsius !== undefined){
let data14 = data5.observed_peak_temperature_celsius;
const _errs52 = errors;
if(!((typeof data14 == "number") && (isFinite(data14)))){
validate31.errors = [{instancePath:instancePath+"/excluded_boundary_events/" + i2+"/observed_peak_temperature_celsius",schemaPath:"#/components/schemas/Event/properties/observed_peak_temperature_celsius/type",keyword:"type",params:{type: "number"},message:"must be number"}];
return false;
}
var valid5 = _errs52 === errors;
}
else {
var valid5 = true;
}
if(valid5){
if(data5.observed_mean_exceedance_celsius !== undefined){
let data15 = data5.observed_mean_exceedance_celsius;
const _errs54 = errors;
if(!((typeof data15 == "number") && (isFinite(data15)))){
validate31.errors = [{instancePath:instancePath+"/excluded_boundary_events/" + i2+"/observed_mean_exceedance_celsius",schemaPath:"#/components/schemas/Event/properties/observed_mean_exceedance_celsius/type",keyword:"type",params:{type: "number"},message:"must be number"}];
return false;
}
var valid5 = _errs54 === errors;
}
else {
var valid5 = true;
}
if(valid5){
if(data5.truncated_start !== undefined){
const _errs56 = errors;
if(typeof data5.truncated_start !== "boolean"){
validate31.errors = [{instancePath:instancePath+"/excluded_boundary_events/" + i2+"/truncated_start",schemaPath:"#/components/schemas/Event/properties/truncated_start/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"}];
return false;
}
var valid5 = _errs56 === errors;
}
else {
var valid5 = true;
}
if(valid5){
if(data5.truncated_end !== undefined){
const _errs58 = errors;
if(typeof data5.truncated_end !== "boolean"){
validate31.errors = [{instancePath:instancePath+"/excluded_boundary_events/" + i2+"/truncated_end",schemaPath:"#/components/schemas/Event/properties/truncated_end/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"}];
return false;
}
var valid5 = _errs58 === errors;
}
else {
var valid5 = true;
}
if(valid5){
if(data5.qualification_confirmed !== undefined){
const _errs60 = errors;
if(typeof data5.qualification_confirmed !== "boolean"){
validate31.errors = [{instancePath:instancePath+"/excluded_boundary_events/" + i2+"/qualification_confirmed",schemaPath:"#/components/schemas/Event/properties/qualification_confirmed/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"}];
return false;
}
var valid5 = _errs60 === errors;
}
else {
var valid5 = true;
}
if(valid5){
if(data5.started_in_selection !== undefined){
let data19 = data5.started_in_selection;
const _errs62 = errors;
const _errs63 = errors;
let valid11 = false;
const _errs64 = errors;
if(typeof data19 !== "boolean"){
const err17 = {instancePath:instancePath+"/excluded_boundary_events/" + i2+"/started_in_selection",schemaPath:"#/components/schemas/Event/properties/started_in_selection/anyOf/0/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
var _valid5 = _errs64 === errors;
valid11 = valid11 || _valid5;
const _errs66 = errors;
if(data19 !== null){
const err18 = {instancePath:instancePath+"/excluded_boundary_events/" + i2+"/started_in_selection",schemaPath:"#/components/schemas/Event/properties/started_in_selection/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
var _valid5 = _errs66 === errors;
valid11 = valid11 || _valid5;
if(!valid11){
const err19 = {instancePath:instancePath+"/excluded_boundary_events/" + i2+"/started_in_selection",schemaPath:"#/components/schemas/Event/properties/started_in_selection/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
validate31.errors = vErrors;
return false;
}
else {
errors = _errs63;
if(vErrors !== null){
if(_errs63){
vErrors.length = _errs63;
}
else {
vErrors = null;
}
}
}
var valid5 = _errs62 === errors;
}
else {
var valid5 = true;
}
if(valid5){
if(data5.eligible_for_complete_metrics !== undefined){
const _errs68 = errors;
if(typeof data5.eligible_for_complete_metrics !== "boolean"){
validate31.errors = [{instancePath:instancePath+"/excluded_boundary_events/" + i2+"/eligible_for_complete_metrics",schemaPath:"#/components/schemas/Event/properties/eligible_for_complete_metrics/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"}];
return false;
}
var valid5 = _errs68 === errors;
}
else {
var valid5 = true;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
else {
validate31.errors = [{instancePath:instancePath+"/excluded_boundary_events/" + i2,schemaPath:"#/components/schemas/Event/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid3 = _errs12 === errors;
if(!valid3){
break;
}
}
}
else {
validate31.errors = [{instancePath:instancePath+"/excluded_boundary_events",schemaPath:"#/properties/excluded_boundary_events/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs10 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.counting_metadata !== undefined){
let data21 = data.counting_metadata;
const _errs70 = errors;
const _errs71 = errors;
if(errors === _errs71){
if(data21 && typeof data21 == "object" && !Array.isArray(data21)){
let missing2;
if((((((((data21.event_count === undefined) && (missing2 = "event_count")) || ((data21.duration === undefined) && (missing2 = "duration"))) || ((data21.heatwave_days === undefined) && (missing2 = "heatwave_days"))) || ((data21.intensity === undefined) && (missing2 = "intensity"))) || ((data21.peak === undefined) && (missing2 = "peak"))) || ((data21.boundary_policy === undefined) && (missing2 = "boundary_policy"))) || ((data21.units === undefined) && (missing2 = "units"))){
validate31.errors = [{instancePath:instancePath+"/counting_metadata",schemaPath:"#/components/schemas/CountingMetadata/required",keyword:"required",params:{missingProperty: missing2},message:"must have required property '"+missing2+"'"}];
return false;
}
else {
const _errs73 = errors;
for(const key2 in data21){
if(!(((((((key2 === "event_count") || (key2 === "duration")) || (key2 === "heatwave_days")) || (key2 === "intensity")) || (key2 === "peak")) || (key2 === "boundary_policy")) || (key2 === "units"))){
validate31.errors = [{instancePath:instancePath+"/counting_metadata",schemaPath:"#/components/schemas/CountingMetadata/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs73 === errors){
if(data21.event_count !== undefined){
const _errs74 = errors;
if(typeof data21.event_count !== "string"){
validate31.errors = [{instancePath:instancePath+"/counting_metadata/event_count",schemaPath:"#/components/schemas/CountingMetadata/properties/event_count/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid13 = _errs74 === errors;
}
else {
var valid13 = true;
}
if(valid13){
if(data21.duration !== undefined){
const _errs76 = errors;
if(typeof data21.duration !== "string"){
validate31.errors = [{instancePath:instancePath+"/counting_metadata/duration",schemaPath:"#/components/schemas/CountingMetadata/properties/duration/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid13 = _errs76 === errors;
}
else {
var valid13 = true;
}
if(valid13){
if(data21.heatwave_days !== undefined){
const _errs78 = errors;
if(typeof data21.heatwave_days !== "string"){
validate31.errors = [{instancePath:instancePath+"/counting_metadata/heatwave_days",schemaPath:"#/components/schemas/CountingMetadata/properties/heatwave_days/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid13 = _errs78 === errors;
}
else {
var valid13 = true;
}
if(valid13){
if(data21.intensity !== undefined){
const _errs80 = errors;
if(typeof data21.intensity !== "string"){
validate31.errors = [{instancePath:instancePath+"/counting_metadata/intensity",schemaPath:"#/components/schemas/CountingMetadata/properties/intensity/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid13 = _errs80 === errors;
}
else {
var valid13 = true;
}
if(valid13){
if(data21.peak !== undefined){
const _errs82 = errors;
if(typeof data21.peak !== "string"){
validate31.errors = [{instancePath:instancePath+"/counting_metadata/peak",schemaPath:"#/components/schemas/CountingMetadata/properties/peak/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid13 = _errs82 === errors;
}
else {
var valid13 = true;
}
if(valid13){
if(data21.boundary_policy !== undefined){
const _errs84 = errors;
if(typeof data21.boundary_policy !== "string"){
validate31.errors = [{instancePath:instancePath+"/counting_metadata/boundary_policy",schemaPath:"#/components/schemas/CountingMetadata/properties/boundary_policy/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid13 = _errs84 === errors;
}
else {
var valid13 = true;
}
if(valid13){
if(data21.units !== undefined){
let data28 = data21.units;
const _errs86 = errors;
if(errors === _errs86){
if(data28 && typeof data28 == "object" && !Array.isArray(data28)){
for(const key3 in data28){
const _errs89 = errors;
if(typeof data28[key3] !== "string"){
validate31.errors = [{instancePath:instancePath+"/counting_metadata/units/" + key3.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/components/schemas/CountingMetadata/properties/units/additionalProperties/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid14 = _errs89 === errors;
if(!valid14){
break;
}
}
}
else {
validate31.errors = [{instancePath:instancePath+"/counting_metadata/units",schemaPath:"#/components/schemas/CountingMetadata/properties/units/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid13 = _errs86 === errors;
}
else {
var valid13 = true;
}
}
}
}
}
}
}
}
}
}
else {
validate31.errors = [{instancePath:instancePath+"/counting_metadata",schemaPath:"#/components/schemas/CountingMetadata/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid0 = _errs70 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
else {
validate31.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate31.errors = vErrors;
return errors === 0;
}
validate31.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema50 = {"properties":{"provider":{"type":"string","const":"Open-Meteo","title":"Provider"},"url":{"type":"string","title":"Url"},"licence":{"type":"string","title":"Licence"},"dataset":{"type":"string","title":"Dataset"},"changes":{"type":"string","title":"Changes"},"model":{"type":"string","const":"era5","title":"Model"},"coordinate_version":{"type":"string","title":"Coordinate Version"},"weather_schema_version":{"type":"integer","title":"Weather Schema Version"},"generated_at":{"type":"string","format":"date-time","title":"Generated At"},"analysis_cache_status":{"type":"string","enum":["computed","hit","coalesced"],"title":"Analysis Cache Status"},"weather_years":{"items":{"$ref":"#/components/schemas/WeatherSource"},"type":"array","title":"Weather Years"}},"additionalProperties":false,"type":"object","required":["provider","url","licence","dataset","changes","model","coordinate_version","weather_schema_version","generated_at","analysis_cache_status","weather_years"],"title":"Source"};
const formats16 = formatModule.fullFormats["date-time"];
const schema51 = {"properties":{"year":{"type":"integer","title":"Year"},"revision":{"type":"string","title":"Revision"},"fetched_at":{"type":"string","format":"date-time","title":"Fetched At"},"cache_status":{"type":"string","enum":["hit","fetched","refreshed","stale"],"title":"Cache Status"},"grid_coordinates":{"$ref":"#/components/schemas/Coordinates"},"timezone":{"type":"string","title":"Timezone"},"coverage":{"type":"number","title":"Coverage"}},"additionalProperties":false,"type":"object","required":["year","revision","fetched_at","cache_status","grid_coordinates","timezone","coverage"],"title":"WeatherSource"};
const schema52 = {"properties":{"latitude":{"type":"number","title":"Latitude"},"longitude":{"type":"number","title":"Longitude"}},"additionalProperties":false,"type":"object","required":["latitude","longitude"],"title":"Coordinates"};

function validate34(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate34.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((((data.year === undefined) && (missing0 = "year")) || ((data.revision === undefined) && (missing0 = "revision"))) || ((data.fetched_at === undefined) && (missing0 = "fetched_at"))) || ((data.cache_status === undefined) && (missing0 = "cache_status"))) || ((data.grid_coordinates === undefined) && (missing0 = "grid_coordinates"))) || ((data.timezone === undefined) && (missing0 = "timezone"))) || ((data.coverage === undefined) && (missing0 = "coverage"))){
validate34.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((((key0 === "year") || (key0 === "revision")) || (key0 === "fetched_at")) || (key0 === "cache_status")) || (key0 === "grid_coordinates")) || (key0 === "timezone")) || (key0 === "coverage"))){
validate34.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.year !== undefined){
let data0 = data.year;
const _errs2 = errors;
if(!(((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0))) && (isFinite(data0)))){
validate34.errors = [{instancePath:instancePath+"/year",schemaPath:"#/properties/year/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.revision !== undefined){
const _errs4 = errors;
if(typeof data.revision !== "string"){
validate34.errors = [{instancePath:instancePath+"/revision",schemaPath:"#/properties/revision/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.fetched_at !== undefined){
let data2 = data.fetched_at;
const _errs6 = errors;
if(errors === _errs6){
if(errors === _errs6){
if(typeof data2 === "string"){
if(!(formats16.validate(data2))){
validate34.errors = [{instancePath:instancePath+"/fetched_at",schemaPath:"#/properties/fetched_at/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate34.errors = [{instancePath:instancePath+"/fetched_at",schemaPath:"#/properties/fetched_at/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.cache_status !== undefined){
let data3 = data.cache_status;
const _errs8 = errors;
if(typeof data3 !== "string"){
validate34.errors = [{instancePath:instancePath+"/cache_status",schemaPath:"#/properties/cache_status/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!((((data3 === "hit") || (data3 === "fetched")) || (data3 === "refreshed")) || (data3 === "stale"))){
validate34.errors = [{instancePath:instancePath+"/cache_status",schemaPath:"#/properties/cache_status/enum",keyword:"enum",params:{allowedValues: schema51.properties.cache_status.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.grid_coordinates !== undefined){
let data4 = data.grid_coordinates;
const _errs10 = errors;
const _errs11 = errors;
if(errors === _errs11){
if(data4 && typeof data4 == "object" && !Array.isArray(data4)){
let missing1;
if(((data4.latitude === undefined) && (missing1 = "latitude")) || ((data4.longitude === undefined) && (missing1 = "longitude"))){
validate34.errors = [{instancePath:instancePath+"/grid_coordinates",schemaPath:"#/components/schemas/Coordinates/required",keyword:"required",params:{missingProperty: missing1},message:"must have required property '"+missing1+"'"}];
return false;
}
else {
const _errs13 = errors;
for(const key1 in data4){
if(!((key1 === "latitude") || (key1 === "longitude"))){
validate34.errors = [{instancePath:instancePath+"/grid_coordinates",schemaPath:"#/components/schemas/Coordinates/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs13 === errors){
if(data4.latitude !== undefined){
let data5 = data4.latitude;
const _errs14 = errors;
if(!((typeof data5 == "number") && (isFinite(data5)))){
validate34.errors = [{instancePath:instancePath+"/grid_coordinates/latitude",schemaPath:"#/components/schemas/Coordinates/properties/latitude/type",keyword:"type",params:{type: "number"},message:"must be number"}];
return false;
}
var valid2 = _errs14 === errors;
}
else {
var valid2 = true;
}
if(valid2){
if(data4.longitude !== undefined){
let data6 = data4.longitude;
const _errs16 = errors;
if(!((typeof data6 == "number") && (isFinite(data6)))){
validate34.errors = [{instancePath:instancePath+"/grid_coordinates/longitude",schemaPath:"#/components/schemas/Coordinates/properties/longitude/type",keyword:"type",params:{type: "number"},message:"must be number"}];
return false;
}
var valid2 = _errs16 === errors;
}
else {
var valid2 = true;
}
}
}
}
}
else {
validate34.errors = [{instancePath:instancePath+"/grid_coordinates",schemaPath:"#/components/schemas/Coordinates/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid0 = _errs10 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.timezone !== undefined){
const _errs18 = errors;
if(typeof data.timezone !== "string"){
validate34.errors = [{instancePath:instancePath+"/timezone",schemaPath:"#/properties/timezone/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs18 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.coverage !== undefined){
let data8 = data.coverage;
const _errs20 = errors;
if(!((typeof data8 == "number") && (isFinite(data8)))){
validate34.errors = [{instancePath:instancePath+"/coverage",schemaPath:"#/properties/coverage/type",keyword:"type",params:{type: "number"},message:"must be number"}];
return false;
}
var valid0 = _errs20 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
else {
validate34.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate34.errors = vErrors;
return errors === 0;
}
validate34.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate33(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate33.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((((((((data.provider === undefined) && (missing0 = "provider")) || ((data.url === undefined) && (missing0 = "url"))) || ((data.licence === undefined) && (missing0 = "licence"))) || ((data.dataset === undefined) && (missing0 = "dataset"))) || ((data.changes === undefined) && (missing0 = "changes"))) || ((data.model === undefined) && (missing0 = "model"))) || ((data.coordinate_version === undefined) && (missing0 = "coordinate_version"))) || ((data.weather_schema_version === undefined) && (missing0 = "weather_schema_version"))) || ((data.generated_at === undefined) && (missing0 = "generated_at"))) || ((data.analysis_cache_status === undefined) && (missing0 = "analysis_cache_status"))) || ((data.weather_years === undefined) && (missing0 = "weather_years"))){
validate33.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(func1.call(schema50.properties, key0))){
validate33.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.provider !== undefined){
let data0 = data.provider;
const _errs2 = errors;
if(typeof data0 !== "string"){
validate33.errors = [{instancePath:instancePath+"/provider",schemaPath:"#/properties/provider/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if("Open-Meteo" !== data0){
validate33.errors = [{instancePath:instancePath+"/provider",schemaPath:"#/properties/provider/const",keyword:"const",params:{allowedValue: "Open-Meteo"},message:"must be equal to constant"}];
return false;
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.url !== undefined){
const _errs4 = errors;
if(typeof data.url !== "string"){
validate33.errors = [{instancePath:instancePath+"/url",schemaPath:"#/properties/url/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.licence !== undefined){
const _errs6 = errors;
if(typeof data.licence !== "string"){
validate33.errors = [{instancePath:instancePath+"/licence",schemaPath:"#/properties/licence/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataset !== undefined){
const _errs8 = errors;
if(typeof data.dataset !== "string"){
validate33.errors = [{instancePath:instancePath+"/dataset",schemaPath:"#/properties/dataset/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.changes !== undefined){
const _errs10 = errors;
if(typeof data.changes !== "string"){
validate33.errors = [{instancePath:instancePath+"/changes",schemaPath:"#/properties/changes/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs10 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.model !== undefined){
let data5 = data.model;
const _errs12 = errors;
if(typeof data5 !== "string"){
validate33.errors = [{instancePath:instancePath+"/model",schemaPath:"#/properties/model/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if("era5" !== data5){
validate33.errors = [{instancePath:instancePath+"/model",schemaPath:"#/properties/model/const",keyword:"const",params:{allowedValue: "era5"},message:"must be equal to constant"}];
return false;
}
var valid0 = _errs12 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.coordinate_version !== undefined){
const _errs14 = errors;
if(typeof data.coordinate_version !== "string"){
validate33.errors = [{instancePath:instancePath+"/coordinate_version",schemaPath:"#/properties/coordinate_version/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs14 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.weather_schema_version !== undefined){
let data7 = data.weather_schema_version;
const _errs16 = errors;
if(!(((typeof data7 == "number") && (!(data7 % 1) && !isNaN(data7))) && (isFinite(data7)))){
validate33.errors = [{instancePath:instancePath+"/weather_schema_version",schemaPath:"#/properties/weather_schema_version/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid0 = _errs16 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.generated_at !== undefined){
let data8 = data.generated_at;
const _errs18 = errors;
if(errors === _errs18){
if(errors === _errs18){
if(typeof data8 === "string"){
if(!(formats16.validate(data8))){
validate33.errors = [{instancePath:instancePath+"/generated_at",schemaPath:"#/properties/generated_at/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate33.errors = [{instancePath:instancePath+"/generated_at",schemaPath:"#/properties/generated_at/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs18 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.analysis_cache_status !== undefined){
let data9 = data.analysis_cache_status;
const _errs20 = errors;
if(typeof data9 !== "string"){
validate33.errors = [{instancePath:instancePath+"/analysis_cache_status",schemaPath:"#/properties/analysis_cache_status/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!(((data9 === "computed") || (data9 === "hit")) || (data9 === "coalesced"))){
validate33.errors = [{instancePath:instancePath+"/analysis_cache_status",schemaPath:"#/properties/analysis_cache_status/enum",keyword:"enum",params:{allowedValues: schema50.properties.analysis_cache_status.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs20 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.weather_years !== undefined){
let data10 = data.weather_years;
const _errs22 = errors;
if(errors === _errs22){
if(Array.isArray(data10)){
var valid1 = true;
const len0 = data10.length;
for(let i0=0; i0<len0; i0++){
const _errs24 = errors;
if(!(validate34(data10[i0], {instancePath:instancePath+"/weather_years/" + i0,parentData:data10,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate34.errors : vErrors.concat(validate34.errors);
errors = vErrors.length;
}
var valid1 = _errs24 === errors;
if(!valid1){
break;
}
}
}
else {
validate33.errors = [{instancePath:instancePath+"/weather_years",schemaPath:"#/properties/weather_years/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs22 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
else {
validate33.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate33.errors = vErrors;
return errors === 0;
}
validate33.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate22(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate22.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((((((((((data.region === undefined) && (missing0 = "region")) || ((data.period === undefined) && (missing0 = "period"))) || ((data.methodology === undefined) && (missing0 = "methodology"))) || ((data.summary === undefined) && (missing0 = "summary"))) || ((data.annual_metrics === undefined) && (missing0 = "annual_metrics"))) || ((data.trend === undefined) && (missing0 = "trend"))) || ((data.events === undefined) && (missing0 = "events"))) || ((data.insights === undefined) && (missing0 = "insights"))) || ((data.data_quality === undefined) && (missing0 = "data_quality"))) || ((data.source === undefined) && (missing0 = "source"))){
validate22.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(func1.call(schema33.properties, key0))){
validate22.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.region !== undefined){
let data0 = data.region;
const _errs2 = errors;
const _errs3 = errors;
if(errors === _errs3){
if(data0 && typeof data0 == "object" && !Array.isArray(data0)){
let missing1;
if((((((data0.id === undefined) && (missing1 = "id")) || ((data0.name === undefined) && (missing1 = "name"))) || ((data0.latitude === undefined) && (missing1 = "latitude"))) || ((data0.longitude === undefined) && (missing1 = "longitude"))) || ((data0.timezone === undefined) && (missing1 = "timezone"))){
validate22.errors = [{instancePath:instancePath+"/region",schemaPath:"#/components/schemas/AnalysisRegion/required",keyword:"required",params:{missingProperty: missing1},message:"must have required property '"+missing1+"'"}];
return false;
}
else {
const _errs5 = errors;
for(const key1 in data0){
if(!(((((key1 === "id") || (key1 === "name")) || (key1 === "latitude")) || (key1 === "longitude")) || (key1 === "timezone"))){
validate22.errors = [{instancePath:instancePath+"/region",schemaPath:"#/components/schemas/AnalysisRegion/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs5 === errors){
if(data0.id !== undefined){
let data1 = data0.id;
const _errs6 = errors;
if(typeof data1 !== "string"){
validate22.errors = [{instancePath:instancePath+"/region/id",schemaPath:"#/components/schemas/AnalysisRegion/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!(((((data1 === "delhi") || (data1 === "mumbai")) || (data1 === "bengaluru")) || (data1 === "chennai")) || (data1 === "hyderabad"))){
validate22.errors = [{instancePath:instancePath+"/region/id",schemaPath:"#/components/schemas/AnalysisRegion/properties/id/enum",keyword:"enum",params:{allowedValues: schema34.properties.id.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid2 = _errs6 === errors;
}
else {
var valid2 = true;
}
if(valid2){
if(data0.name !== undefined){
const _errs8 = errors;
if(typeof data0.name !== "string"){
validate22.errors = [{instancePath:instancePath+"/region/name",schemaPath:"#/components/schemas/AnalysisRegion/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid2 = _errs8 === errors;
}
else {
var valid2 = true;
}
if(valid2){
if(data0.latitude !== undefined){
let data3 = data0.latitude;
const _errs10 = errors;
if(!((typeof data3 == "number") && (isFinite(data3)))){
validate22.errors = [{instancePath:instancePath+"/region/latitude",schemaPath:"#/components/schemas/AnalysisRegion/properties/latitude/type",keyword:"type",params:{type: "number"},message:"must be number"}];
return false;
}
var valid2 = _errs10 === errors;
}
else {
var valid2 = true;
}
if(valid2){
if(data0.longitude !== undefined){
let data4 = data0.longitude;
const _errs12 = errors;
if(!((typeof data4 == "number") && (isFinite(data4)))){
validate22.errors = [{instancePath:instancePath+"/region/longitude",schemaPath:"#/components/schemas/AnalysisRegion/properties/longitude/type",keyword:"type",params:{type: "number"},message:"must be number"}];
return false;
}
var valid2 = _errs12 === errors;
}
else {
var valid2 = true;
}
if(valid2){
if(data0.timezone !== undefined){
const _errs14 = errors;
if(typeof data0.timezone !== "string"){
validate22.errors = [{instancePath:instancePath+"/region/timezone",schemaPath:"#/components/schemas/AnalysisRegion/properties/timezone/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid2 = _errs14 === errors;
}
else {
var valid2 = true;
}
}
}
}
}
}
}
}
else {
validate22.errors = [{instancePath:instancePath+"/region",schemaPath:"#/components/schemas/AnalysisRegion/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.period !== undefined){
let data6 = data.period;
const _errs16 = errors;
const _errs17 = errors;
if(errors === _errs17){
if(data6 && typeof data6 == "object" && !Array.isArray(data6)){
let missing2;
if((((data6.start_year === undefined) && (missing2 = "start_year")) || ((data6.end_year === undefined) && (missing2 = "end_year"))) || ((data6.hazard === undefined) && (missing2 = "hazard"))){
validate22.errors = [{instancePath:instancePath+"/period",schemaPath:"#/components/schemas/Period/required",keyword:"required",params:{missingProperty: missing2},message:"must have required property '"+missing2+"'"}];
return false;
}
else {
const _errs19 = errors;
for(const key2 in data6){
if(!(((key2 === "start_year") || (key2 === "end_year")) || (key2 === "hazard"))){
validate22.errors = [{instancePath:instancePath+"/period",schemaPath:"#/components/schemas/Period/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs19 === errors){
if(data6.start_year !== undefined){
let data7 = data6.start_year;
const _errs20 = errors;
if(!(((typeof data7 == "number") && (!(data7 % 1) && !isNaN(data7))) && (isFinite(data7)))){
validate22.errors = [{instancePath:instancePath+"/period/start_year",schemaPath:"#/components/schemas/Period/properties/start_year/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid4 = _errs20 === errors;
}
else {
var valid4 = true;
}
if(valid4){
if(data6.end_year !== undefined){
let data8 = data6.end_year;
const _errs22 = errors;
if(!(((typeof data8 == "number") && (!(data8 % 1) && !isNaN(data8))) && (isFinite(data8)))){
validate22.errors = [{instancePath:instancePath+"/period/end_year",schemaPath:"#/components/schemas/Period/properties/end_year/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid4 = _errs22 === errors;
}
else {
var valid4 = true;
}
if(valid4){
if(data6.hazard !== undefined){
let data9 = data6.hazard;
const _errs24 = errors;
if(typeof data9 !== "string"){
validate22.errors = [{instancePath:instancePath+"/period/hazard",schemaPath:"#/components/schemas/Period/properties/hazard/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if("heatwave" !== data9){
validate22.errors = [{instancePath:instancePath+"/period/hazard",schemaPath:"#/components/schemas/Period/properties/hazard/const",keyword:"const",params:{allowedValue: "heatwave"},message:"must be equal to constant"}];
return false;
}
var valid4 = _errs24 === errors;
}
else {
var valid4 = true;
}
}
}
}
}
}
else {
validate22.errors = [{instancePath:instancePath+"/period",schemaPath:"#/components/schemas/Period/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid0 = _errs16 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.methodology !== undefined){
const _errs26 = errors;
if(!(validate23(data.methodology, {instancePath:instancePath+"/methodology",parentData:data,parentDataProperty:"methodology",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate23.errors : vErrors.concat(validate23.errors);
errors = vErrors.length;
}
var valid0 = _errs26 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.summary !== undefined){
let data11 = data.summary;
const _errs27 = errors;
const _errs28 = errors;
if(errors === _errs28){
if(data11 && typeof data11 == "object" && !Array.isArray(data11)){
let missing3;
if((((((((((((data11.event_count === undefined) && (missing3 = "event_count")) || ((data11.heatwave_days === undefined) && (missing3 = "heatwave_days"))) || ((data11.mean_duration_days === undefined) && (missing3 = "mean_duration_days"))) || ((data11.max_duration_days === undefined) && (missing3 = "max_duration_days"))) || ((data11.mean_exceedance_celsius === undefined) && (missing3 = "mean_exceedance_celsius"))) || ((data11.peak_temperature_celsius === undefined) && (missing3 = "peak_temperature_celsius"))) || ((data11.complete === undefined) && (missing3 = "complete"))) || ((data11.partial === undefined) && (missing3 = "partial"))) || ((data11.eligible_year_count === undefined) && (missing3 = "eligible_year_count"))) || ((data11.selected_year_count === undefined) && (missing3 = "selected_year_count"))) || ((data11.excluded_boundary_event_count === undefined) && (missing3 = "excluded_boundary_event_count"))){
validate22.errors = [{instancePath:instancePath+"/summary",schemaPath:"#/components/schemas/Summary/required",keyword:"required",params:{missingProperty: missing3},message:"must have required property '"+missing3+"'"}];
return false;
}
else {
const _errs30 = errors;
for(const key3 in data11){
if(!(func1.call(schema39.properties, key3))){
validate22.errors = [{instancePath:instancePath+"/summary",schemaPath:"#/components/schemas/Summary/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs30 === errors){
if(data11.event_count !== undefined){
let data12 = data11.event_count;
const _errs31 = errors;
if(!(((typeof data12 == "number") && (!(data12 % 1) && !isNaN(data12))) && (isFinite(data12)))){
validate22.errors = [{instancePath:instancePath+"/summary/event_count",schemaPath:"#/components/schemas/Summary/properties/event_count/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs31){
if((typeof data12 == "number") && (isFinite(data12))){
if(data12 < 0 || isNaN(data12)){
validate22.errors = [{instancePath:instancePath+"/summary/event_count",schemaPath:"#/components/schemas/Summary/properties/event_count/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"}];
return false;
}
}
}
var valid6 = _errs31 === errors;
}
else {
var valid6 = true;
}
if(valid6){
if(data11.heatwave_days !== undefined){
let data13 = data11.heatwave_days;
const _errs33 = errors;
if(!(((typeof data13 == "number") && (!(data13 % 1) && !isNaN(data13))) && (isFinite(data13)))){
validate22.errors = [{instancePath:instancePath+"/summary/heatwave_days",schemaPath:"#/components/schemas/Summary/properties/heatwave_days/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs33){
if((typeof data13 == "number") && (isFinite(data13))){
if(data13 < 0 || isNaN(data13)){
validate22.errors = [{instancePath:instancePath+"/summary/heatwave_days",schemaPath:"#/components/schemas/Summary/properties/heatwave_days/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"}];
return false;
}
}
}
var valid6 = _errs33 === errors;
}
else {
var valid6 = true;
}
if(valid6){
if(data11.mean_duration_days !== undefined){
let data14 = data11.mean_duration_days;
const _errs35 = errors;
const _errs36 = errors;
let valid7 = false;
const _errs37 = errors;
if(!((typeof data14 == "number") && (isFinite(data14)))){
const err0 = {instancePath:instancePath+"/summary/mean_duration_days",schemaPath:"#/components/schemas/Summary/properties/mean_duration_days/anyOf/0/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
var _valid0 = _errs37 === errors;
valid7 = valid7 || _valid0;
const _errs39 = errors;
if(data14 !== null){
const err1 = {instancePath:instancePath+"/summary/mean_duration_days",schemaPath:"#/components/schemas/Summary/properties/mean_duration_days/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
var _valid0 = _errs39 === errors;
valid7 = valid7 || _valid0;
if(!valid7){
const err2 = {instancePath:instancePath+"/summary/mean_duration_days",schemaPath:"#/components/schemas/Summary/properties/mean_duration_days/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
validate22.errors = vErrors;
return false;
}
else {
errors = _errs36;
if(vErrors !== null){
if(_errs36){
vErrors.length = _errs36;
}
else {
vErrors = null;
}
}
}
var valid6 = _errs35 === errors;
}
else {
var valid6 = true;
}
if(valid6){
if(data11.max_duration_days !== undefined){
let data15 = data11.max_duration_days;
const _errs41 = errors;
const _errs42 = errors;
let valid8 = false;
const _errs43 = errors;
if(!(((typeof data15 == "number") && (!(data15 % 1) && !isNaN(data15))) && (isFinite(data15)))){
const err3 = {instancePath:instancePath+"/summary/max_duration_days",schemaPath:"#/components/schemas/Summary/properties/max_duration_days/anyOf/0/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
var _valid1 = _errs43 === errors;
valid8 = valid8 || _valid1;
const _errs45 = errors;
if(data15 !== null){
const err4 = {instancePath:instancePath+"/summary/max_duration_days",schemaPath:"#/components/schemas/Summary/properties/max_duration_days/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
var _valid1 = _errs45 === errors;
valid8 = valid8 || _valid1;
if(!valid8){
const err5 = {instancePath:instancePath+"/summary/max_duration_days",schemaPath:"#/components/schemas/Summary/properties/max_duration_days/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
validate22.errors = vErrors;
return false;
}
else {
errors = _errs42;
if(vErrors !== null){
if(_errs42){
vErrors.length = _errs42;
}
else {
vErrors = null;
}
}
}
var valid6 = _errs41 === errors;
}
else {
var valid6 = true;
}
if(valid6){
if(data11.mean_exceedance_celsius !== undefined){
let data16 = data11.mean_exceedance_celsius;
const _errs47 = errors;
const _errs48 = errors;
let valid9 = false;
const _errs49 = errors;
if(!((typeof data16 == "number") && (isFinite(data16)))){
const err6 = {instancePath:instancePath+"/summary/mean_exceedance_celsius",schemaPath:"#/components/schemas/Summary/properties/mean_exceedance_celsius/anyOf/0/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
var _valid2 = _errs49 === errors;
valid9 = valid9 || _valid2;
const _errs51 = errors;
if(data16 !== null){
const err7 = {instancePath:instancePath+"/summary/mean_exceedance_celsius",schemaPath:"#/components/schemas/Summary/properties/mean_exceedance_celsius/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
var _valid2 = _errs51 === errors;
valid9 = valid9 || _valid2;
if(!valid9){
const err8 = {instancePath:instancePath+"/summary/mean_exceedance_celsius",schemaPath:"#/components/schemas/Summary/properties/mean_exceedance_celsius/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
validate22.errors = vErrors;
return false;
}
else {
errors = _errs48;
if(vErrors !== null){
if(_errs48){
vErrors.length = _errs48;
}
else {
vErrors = null;
}
}
}
var valid6 = _errs47 === errors;
}
else {
var valid6 = true;
}
if(valid6){
if(data11.peak_temperature_celsius !== undefined){
let data17 = data11.peak_temperature_celsius;
const _errs53 = errors;
const _errs54 = errors;
let valid10 = false;
const _errs55 = errors;
if(!((typeof data17 == "number") && (isFinite(data17)))){
const err9 = {instancePath:instancePath+"/summary/peak_temperature_celsius",schemaPath:"#/components/schemas/Summary/properties/peak_temperature_celsius/anyOf/0/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
var _valid3 = _errs55 === errors;
valid10 = valid10 || _valid3;
const _errs57 = errors;
if(data17 !== null){
const err10 = {instancePath:instancePath+"/summary/peak_temperature_celsius",schemaPath:"#/components/schemas/Summary/properties/peak_temperature_celsius/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
var _valid3 = _errs57 === errors;
valid10 = valid10 || _valid3;
if(!valid10){
const err11 = {instancePath:instancePath+"/summary/peak_temperature_celsius",schemaPath:"#/components/schemas/Summary/properties/peak_temperature_celsius/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
validate22.errors = vErrors;
return false;
}
else {
errors = _errs54;
if(vErrors !== null){
if(_errs54){
vErrors.length = _errs54;
}
else {
vErrors = null;
}
}
}
var valid6 = _errs53 === errors;
}
else {
var valid6 = true;
}
if(valid6){
if(data11.complete !== undefined){
const _errs59 = errors;
if(typeof data11.complete !== "boolean"){
validate22.errors = [{instancePath:instancePath+"/summary/complete",schemaPath:"#/components/schemas/Summary/properties/complete/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"}];
return false;
}
var valid6 = _errs59 === errors;
}
else {
var valid6 = true;
}
if(valid6){
if(data11.partial !== undefined){
const _errs61 = errors;
if(typeof data11.partial !== "boolean"){
validate22.errors = [{instancePath:instancePath+"/summary/partial",schemaPath:"#/components/schemas/Summary/properties/partial/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"}];
return false;
}
var valid6 = _errs61 === errors;
}
else {
var valid6 = true;
}
if(valid6){
if(data11.eligible_year_count !== undefined){
let data20 = data11.eligible_year_count;
const _errs63 = errors;
if(!(((typeof data20 == "number") && (!(data20 % 1) && !isNaN(data20))) && (isFinite(data20)))){
validate22.errors = [{instancePath:instancePath+"/summary/eligible_year_count",schemaPath:"#/components/schemas/Summary/properties/eligible_year_count/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid6 = _errs63 === errors;
}
else {
var valid6 = true;
}
if(valid6){
if(data11.selected_year_count !== undefined){
let data21 = data11.selected_year_count;
const _errs65 = errors;
if(!(((typeof data21 == "number") && (!(data21 % 1) && !isNaN(data21))) && (isFinite(data21)))){
validate22.errors = [{instancePath:instancePath+"/summary/selected_year_count",schemaPath:"#/components/schemas/Summary/properties/selected_year_count/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid6 = _errs65 === errors;
}
else {
var valid6 = true;
}
if(valid6){
if(data11.excluded_boundary_event_count !== undefined){
let data22 = data11.excluded_boundary_event_count;
const _errs67 = errors;
if(!(((typeof data22 == "number") && (!(data22 % 1) && !isNaN(data22))) && (isFinite(data22)))){
validate22.errors = [{instancePath:instancePath+"/summary/excluded_boundary_event_count",schemaPath:"#/components/schemas/Summary/properties/excluded_boundary_event_count/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid6 = _errs67 === errors;
}
else {
var valid6 = true;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
else {
validate22.errors = [{instancePath:instancePath+"/summary",schemaPath:"#/components/schemas/Summary/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid0 = _errs27 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.annual_metrics !== undefined){
let data23 = data.annual_metrics;
const _errs69 = errors;
if(errors === _errs69){
if(Array.isArray(data23)){
var valid11 = true;
const len0 = data23.length;
for(let i0=0; i0<len0; i0++){
let data24 = data23[i0];
const _errs71 = errors;
const _errs72 = errors;
if(errors === _errs72){
if(data24 && typeof data24 == "object" && !Array.isArray(data24)){
let missing4;
if(((((((((((((((data24.year === undefined) && (missing4 = "year")) || ((data24.expected_days === undefined) && (missing4 = "expected_days"))) || ((data24.valid_days === undefined) && (missing4 = "valid_days"))) || ((data24.coverage === undefined) && (missing4 = "coverage"))) || ((data24.event_count === undefined) && (missing4 = "event_count"))) || ((data24.heatwave_days === undefined) && (missing4 = "heatwave_days"))) || ((data24.mean_duration_days === undefined) && (missing4 = "mean_duration_days"))) || ((data24.max_duration_days === undefined) && (missing4 = "max_duration_days"))) || ((data24.mean_exceedance_celsius === undefined) && (missing4 = "mean_exceedance_celsius"))) || ((data24.peak_temperature_celsius === undefined) && (missing4 = "peak_temperature_celsius"))) || ((data24.complete === undefined) && (missing4 = "complete"))) || ((data24.partial === undefined) && (missing4 = "partial"))) || ((data24.incomplete_reasons === undefined) && (missing4 = "incomplete_reasons"))) || ((data24.rolling_average_event_count === undefined) && (missing4 = "rolling_average_event_count"))){
validate22.errors = [{instancePath:instancePath+"/annual_metrics/" + i0,schemaPath:"#/components/schemas/AnnualMetrics/required",keyword:"required",params:{missingProperty: missing4},message:"must have required property '"+missing4+"'"}];
return false;
}
else {
const _errs74 = errors;
for(const key4 in data24){
if(!(func1.call(schema40.properties, key4))){
validate22.errors = [{instancePath:instancePath+"/annual_metrics/" + i0,schemaPath:"#/components/schemas/AnnualMetrics/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs74 === errors){
if(data24.year !== undefined){
let data25 = data24.year;
const _errs75 = errors;
if(!(((typeof data25 == "number") && (!(data25 % 1) && !isNaN(data25))) && (isFinite(data25)))){
validate22.errors = [{instancePath:instancePath+"/annual_metrics/" + i0+"/year",schemaPath:"#/components/schemas/AnnualMetrics/properties/year/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid13 = _errs75 === errors;
}
else {
var valid13 = true;
}
if(valid13){
if(data24.expected_days !== undefined){
let data26 = data24.expected_days;
const _errs77 = errors;
if(!(((typeof data26 == "number") && (!(data26 % 1) && !isNaN(data26))) && (isFinite(data26)))){
validate22.errors = [{instancePath:instancePath+"/annual_metrics/" + i0+"/expected_days",schemaPath:"#/components/schemas/AnnualMetrics/properties/expected_days/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid13 = _errs77 === errors;
}
else {
var valid13 = true;
}
if(valid13){
if(data24.valid_days !== undefined){
let data27 = data24.valid_days;
const _errs79 = errors;
if(!(((typeof data27 == "number") && (!(data27 % 1) && !isNaN(data27))) && (isFinite(data27)))){
validate22.errors = [{instancePath:instancePath+"/annual_metrics/" + i0+"/valid_days",schemaPath:"#/components/schemas/AnnualMetrics/properties/valid_days/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid13 = _errs79 === errors;
}
else {
var valid13 = true;
}
if(valid13){
if(data24.coverage !== undefined){
let data28 = data24.coverage;
const _errs81 = errors;
if(!((typeof data28 == "number") && (isFinite(data28)))){
validate22.errors = [{instancePath:instancePath+"/annual_metrics/" + i0+"/coverage",schemaPath:"#/components/schemas/AnnualMetrics/properties/coverage/type",keyword:"type",params:{type: "number"},message:"must be number"}];
return false;
}
var valid13 = _errs81 === errors;
}
else {
var valid13 = true;
}
if(valid13){
if(data24.event_count !== undefined){
let data29 = data24.event_count;
const _errs83 = errors;
if(!(((typeof data29 == "number") && (!(data29 % 1) && !isNaN(data29))) && (isFinite(data29)))){
validate22.errors = [{instancePath:instancePath+"/annual_metrics/" + i0+"/event_count",schemaPath:"#/components/schemas/AnnualMetrics/properties/event_count/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs83){
if((typeof data29 == "number") && (isFinite(data29))){
if(data29 < 0 || isNaN(data29)){
validate22.errors = [{instancePath:instancePath+"/annual_metrics/" + i0+"/event_count",schemaPath:"#/components/schemas/AnnualMetrics/properties/event_count/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"}];
return false;
}
}
}
var valid13 = _errs83 === errors;
}
else {
var valid13 = true;
}
if(valid13){
if(data24.heatwave_days !== undefined){
let data30 = data24.heatwave_days;
const _errs85 = errors;
if(!(((typeof data30 == "number") && (!(data30 % 1) && !isNaN(data30))) && (isFinite(data30)))){
validate22.errors = [{instancePath:instancePath+"/annual_metrics/" + i0+"/heatwave_days",schemaPath:"#/components/schemas/AnnualMetrics/properties/heatwave_days/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs85){
if((typeof data30 == "number") && (isFinite(data30))){
if(data30 < 0 || isNaN(data30)){
validate22.errors = [{instancePath:instancePath+"/annual_metrics/" + i0+"/heatwave_days",schemaPath:"#/components/schemas/AnnualMetrics/properties/heatwave_days/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"}];
return false;
}
}
}
var valid13 = _errs85 === errors;
}
else {
var valid13 = true;
}
if(valid13){
if(data24.mean_duration_days !== undefined){
let data31 = data24.mean_duration_days;
const _errs87 = errors;
const _errs88 = errors;
let valid14 = false;
const _errs89 = errors;
if(!((typeof data31 == "number") && (isFinite(data31)))){
const err12 = {instancePath:instancePath+"/annual_metrics/" + i0+"/mean_duration_days",schemaPath:"#/components/schemas/AnnualMetrics/properties/mean_duration_days/anyOf/0/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
var _valid4 = _errs89 === errors;
valid14 = valid14 || _valid4;
const _errs91 = errors;
if(data31 !== null){
const err13 = {instancePath:instancePath+"/annual_metrics/" + i0+"/mean_duration_days",schemaPath:"#/components/schemas/AnnualMetrics/properties/mean_duration_days/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
var _valid4 = _errs91 === errors;
valid14 = valid14 || _valid4;
if(!valid14){
const err14 = {instancePath:instancePath+"/annual_metrics/" + i0+"/mean_duration_days",schemaPath:"#/components/schemas/AnnualMetrics/properties/mean_duration_days/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
validate22.errors = vErrors;
return false;
}
else {
errors = _errs88;
if(vErrors !== null){
if(_errs88){
vErrors.length = _errs88;
}
else {
vErrors = null;
}
}
}
var valid13 = _errs87 === errors;
}
else {
var valid13 = true;
}
if(valid13){
if(data24.max_duration_days !== undefined){
let data32 = data24.max_duration_days;
const _errs93 = errors;
const _errs94 = errors;
let valid15 = false;
const _errs95 = errors;
if(!(((typeof data32 == "number") && (!(data32 % 1) && !isNaN(data32))) && (isFinite(data32)))){
const err15 = {instancePath:instancePath+"/annual_metrics/" + i0+"/max_duration_days",schemaPath:"#/components/schemas/AnnualMetrics/properties/max_duration_days/anyOf/0/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
var _valid5 = _errs95 === errors;
valid15 = valid15 || _valid5;
const _errs97 = errors;
if(data32 !== null){
const err16 = {instancePath:instancePath+"/annual_metrics/" + i0+"/max_duration_days",schemaPath:"#/components/schemas/AnnualMetrics/properties/max_duration_days/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
var _valid5 = _errs97 === errors;
valid15 = valid15 || _valid5;
if(!valid15){
const err17 = {instancePath:instancePath+"/annual_metrics/" + i0+"/max_duration_days",schemaPath:"#/components/schemas/AnnualMetrics/properties/max_duration_days/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
validate22.errors = vErrors;
return false;
}
else {
errors = _errs94;
if(vErrors !== null){
if(_errs94){
vErrors.length = _errs94;
}
else {
vErrors = null;
}
}
}
var valid13 = _errs93 === errors;
}
else {
var valid13 = true;
}
if(valid13){
if(data24.mean_exceedance_celsius !== undefined){
let data33 = data24.mean_exceedance_celsius;
const _errs99 = errors;
const _errs100 = errors;
let valid16 = false;
const _errs101 = errors;
if(!((typeof data33 == "number") && (isFinite(data33)))){
const err18 = {instancePath:instancePath+"/annual_metrics/" + i0+"/mean_exceedance_celsius",schemaPath:"#/components/schemas/AnnualMetrics/properties/mean_exceedance_celsius/anyOf/0/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
var _valid6 = _errs101 === errors;
valid16 = valid16 || _valid6;
const _errs103 = errors;
if(data33 !== null){
const err19 = {instancePath:instancePath+"/annual_metrics/" + i0+"/mean_exceedance_celsius",schemaPath:"#/components/schemas/AnnualMetrics/properties/mean_exceedance_celsius/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
var _valid6 = _errs103 === errors;
valid16 = valid16 || _valid6;
if(!valid16){
const err20 = {instancePath:instancePath+"/annual_metrics/" + i0+"/mean_exceedance_celsius",schemaPath:"#/components/schemas/AnnualMetrics/properties/mean_exceedance_celsius/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
validate22.errors = vErrors;
return false;
}
else {
errors = _errs100;
if(vErrors !== null){
if(_errs100){
vErrors.length = _errs100;
}
else {
vErrors = null;
}
}
}
var valid13 = _errs99 === errors;
}
else {
var valid13 = true;
}
if(valid13){
if(data24.peak_temperature_celsius !== undefined){
let data34 = data24.peak_temperature_celsius;
const _errs105 = errors;
const _errs106 = errors;
let valid17 = false;
const _errs107 = errors;
if(!((typeof data34 == "number") && (isFinite(data34)))){
const err21 = {instancePath:instancePath+"/annual_metrics/" + i0+"/peak_temperature_celsius",schemaPath:"#/components/schemas/AnnualMetrics/properties/peak_temperature_celsius/anyOf/0/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
var _valid7 = _errs107 === errors;
valid17 = valid17 || _valid7;
const _errs109 = errors;
if(data34 !== null){
const err22 = {instancePath:instancePath+"/annual_metrics/" + i0+"/peak_temperature_celsius",schemaPath:"#/components/schemas/AnnualMetrics/properties/peak_temperature_celsius/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
var _valid7 = _errs109 === errors;
valid17 = valid17 || _valid7;
if(!valid17){
const err23 = {instancePath:instancePath+"/annual_metrics/" + i0+"/peak_temperature_celsius",schemaPath:"#/components/schemas/AnnualMetrics/properties/peak_temperature_celsius/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
validate22.errors = vErrors;
return false;
}
else {
errors = _errs106;
if(vErrors !== null){
if(_errs106){
vErrors.length = _errs106;
}
else {
vErrors = null;
}
}
}
var valid13 = _errs105 === errors;
}
else {
var valid13 = true;
}
if(valid13){
if(data24.complete !== undefined){
const _errs111 = errors;
if(typeof data24.complete !== "boolean"){
validate22.errors = [{instancePath:instancePath+"/annual_metrics/" + i0+"/complete",schemaPath:"#/components/schemas/AnnualMetrics/properties/complete/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"}];
return false;
}
var valid13 = _errs111 === errors;
}
else {
var valid13 = true;
}
if(valid13){
if(data24.partial !== undefined){
const _errs113 = errors;
if(typeof data24.partial !== "boolean"){
validate22.errors = [{instancePath:instancePath+"/annual_metrics/" + i0+"/partial",schemaPath:"#/components/schemas/AnnualMetrics/properties/partial/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"}];
return false;
}
var valid13 = _errs113 === errors;
}
else {
var valid13 = true;
}
if(valid13){
if(data24.incomplete_reasons !== undefined){
let data37 = data24.incomplete_reasons;
const _errs115 = errors;
if(errors === _errs115){
if(Array.isArray(data37)){
var valid18 = true;
const len1 = data37.length;
for(let i1=0; i1<len1; i1++){
const _errs117 = errors;
if(typeof data37[i1] !== "string"){
validate22.errors = [{instancePath:instancePath+"/annual_metrics/" + i0+"/incomplete_reasons/" + i1,schemaPath:"#/components/schemas/AnnualMetrics/properties/incomplete_reasons/items/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid18 = _errs117 === errors;
if(!valid18){
break;
}
}
}
else {
validate22.errors = [{instancePath:instancePath+"/annual_metrics/" + i0+"/incomplete_reasons",schemaPath:"#/components/schemas/AnnualMetrics/properties/incomplete_reasons/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid13 = _errs115 === errors;
}
else {
var valid13 = true;
}
if(valid13){
if(data24.rolling_average_event_count !== undefined){
let data39 = data24.rolling_average_event_count;
const _errs119 = errors;
const _errs120 = errors;
let valid19 = false;
const _errs121 = errors;
if(!((typeof data39 == "number") && (isFinite(data39)))){
const err24 = {instancePath:instancePath+"/annual_metrics/" + i0+"/rolling_average_event_count",schemaPath:"#/components/schemas/AnnualMetrics/properties/rolling_average_event_count/anyOf/0/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
var _valid8 = _errs121 === errors;
valid19 = valid19 || _valid8;
const _errs123 = errors;
if(data39 !== null){
const err25 = {instancePath:instancePath+"/annual_metrics/" + i0+"/rolling_average_event_count",schemaPath:"#/components/schemas/AnnualMetrics/properties/rolling_average_event_count/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
var _valid8 = _errs123 === errors;
valid19 = valid19 || _valid8;
if(!valid19){
const err26 = {instancePath:instancePath+"/annual_metrics/" + i0+"/rolling_average_event_count",schemaPath:"#/components/schemas/AnnualMetrics/properties/rolling_average_event_count/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
validate22.errors = vErrors;
return false;
}
else {
errors = _errs120;
if(vErrors !== null){
if(_errs120){
vErrors.length = _errs120;
}
else {
vErrors = null;
}
}
}
var valid13 = _errs119 === errors;
}
else {
var valid13 = true;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
else {
validate22.errors = [{instancePath:instancePath+"/annual_metrics/" + i0,schemaPath:"#/components/schemas/AnnualMetrics/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid11 = _errs71 === errors;
if(!valid11){
break;
}
}
}
else {
validate22.errors = [{instancePath:instancePath+"/annual_metrics",schemaPath:"#/properties/annual_metrics/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs69 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.trend !== undefined){
const _errs125 = errors;
if(!(validate27(data.trend, {instancePath:instancePath+"/trend",parentData:data,parentDataProperty:"trend",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate27.errors : vErrors.concat(validate27.errors);
errors = vErrors.length;
}
var valid0 = _errs125 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.events !== undefined){
let data41 = data.events;
const _errs126 = errors;
if(errors === _errs126){
if(Array.isArray(data41)){
var valid20 = true;
const len2 = data41.length;
for(let i2=0; i2<len2; i2++){
let data42 = data41[i2];
const _errs128 = errors;
const _errs129 = errors;
if(errors === _errs129){
if(data42 && typeof data42 == "object" && !Array.isArray(data42)){
let missing5;
if((((((((((((((((data42.observed_start_date === undefined) && (missing5 = "observed_start_date")) || ((data42.observed_end_date === undefined) && (missing5 = "observed_end_date"))) || ((data42.observed_duration_days === undefined) && (missing5 = "observed_duration_days"))) || ((data42.start_date === undefined) && (missing5 = "start_date"))) || ((data42.end_date === undefined) && (missing5 = "end_date"))) || ((data42.duration_days === undefined) && (missing5 = "duration_days"))) || ((data42.peak_temperature_celsius === undefined) && (missing5 = "peak_temperature_celsius"))) || ((data42.mean_exceedance_celsius === undefined) && (missing5 = "mean_exceedance_celsius"))) || ((data42.observed_peak_temperature_celsius === undefined) && (missing5 = "observed_peak_temperature_celsius"))) || ((data42.observed_mean_exceedance_celsius === undefined) && (missing5 = "observed_mean_exceedance_celsius"))) || ((data42.truncated_start === undefined) && (missing5 = "truncated_start"))) || ((data42.truncated_end === undefined) && (missing5 = "truncated_end"))) || ((data42.qualification_confirmed === undefined) && (missing5 = "qualification_confirmed"))) || ((data42.started_in_selection === undefined) && (missing5 = "started_in_selection"))) || ((data42.eligible_for_complete_metrics === undefined) && (missing5 = "eligible_for_complete_metrics"))){
validate22.errors = [{instancePath:instancePath+"/events/" + i2,schemaPath:"#/components/schemas/Event/required",keyword:"required",params:{missingProperty: missing5},message:"must have required property '"+missing5+"'"}];
return false;
}
else {
const _errs131 = errors;
for(const key5 in data42){
if(!(func1.call(schema46.properties, key5))){
validate22.errors = [{instancePath:instancePath+"/events/" + i2,schemaPath:"#/components/schemas/Event/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key5},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs131 === errors){
if(data42.observed_start_date !== undefined){
let data43 = data42.observed_start_date;
const _errs132 = errors;
if(errors === _errs132){
if(errors === _errs132){
if(typeof data43 === "string"){
if(!(formats0.validate(data43))){
validate22.errors = [{instancePath:instancePath+"/events/" + i2+"/observed_start_date",schemaPath:"#/components/schemas/Event/properties/observed_start_date/format",keyword:"format",params:{format: "date"},message:"must match format \""+"date"+"\""}];
return false;
}
}
else {
validate22.errors = [{instancePath:instancePath+"/events/" + i2+"/observed_start_date",schemaPath:"#/components/schemas/Event/properties/observed_start_date/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid22 = _errs132 === errors;
}
else {
var valid22 = true;
}
if(valid22){
if(data42.observed_end_date !== undefined){
let data44 = data42.observed_end_date;
const _errs134 = errors;
if(errors === _errs134){
if(errors === _errs134){
if(typeof data44 === "string"){
if(!(formats0.validate(data44))){
validate22.errors = [{instancePath:instancePath+"/events/" + i2+"/observed_end_date",schemaPath:"#/components/schemas/Event/properties/observed_end_date/format",keyword:"format",params:{format: "date"},message:"must match format \""+"date"+"\""}];
return false;
}
}
else {
validate22.errors = [{instancePath:instancePath+"/events/" + i2+"/observed_end_date",schemaPath:"#/components/schemas/Event/properties/observed_end_date/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid22 = _errs134 === errors;
}
else {
var valid22 = true;
}
if(valid22){
if(data42.observed_duration_days !== undefined){
let data45 = data42.observed_duration_days;
const _errs136 = errors;
if(!(((typeof data45 == "number") && (!(data45 % 1) && !isNaN(data45))) && (isFinite(data45)))){
validate22.errors = [{instancePath:instancePath+"/events/" + i2+"/observed_duration_days",schemaPath:"#/components/schemas/Event/properties/observed_duration_days/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid22 = _errs136 === errors;
}
else {
var valid22 = true;
}
if(valid22){
if(data42.start_date !== undefined){
let data46 = data42.start_date;
const _errs138 = errors;
const _errs139 = errors;
let valid23 = false;
const _errs140 = errors;
if(errors === _errs140){
if(errors === _errs140){
if(typeof data46 === "string"){
if(!(formats0.validate(data46))){
const err27 = {instancePath:instancePath+"/events/" + i2+"/start_date",schemaPath:"#/components/schemas/Event/properties/start_date/anyOf/0/format",keyword:"format",params:{format: "date"},message:"must match format \""+"date"+"\""};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
else {
const err28 = {instancePath:instancePath+"/events/" + i2+"/start_date",schemaPath:"#/components/schemas/Event/properties/start_date/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
}
var _valid9 = _errs140 === errors;
valid23 = valid23 || _valid9;
const _errs142 = errors;
if(data46 !== null){
const err29 = {instancePath:instancePath+"/events/" + i2+"/start_date",schemaPath:"#/components/schemas/Event/properties/start_date/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
var _valid9 = _errs142 === errors;
valid23 = valid23 || _valid9;
if(!valid23){
const err30 = {instancePath:instancePath+"/events/" + i2+"/start_date",schemaPath:"#/components/schemas/Event/properties/start_date/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
validate22.errors = vErrors;
return false;
}
else {
errors = _errs139;
if(vErrors !== null){
if(_errs139){
vErrors.length = _errs139;
}
else {
vErrors = null;
}
}
}
var valid22 = _errs138 === errors;
}
else {
var valid22 = true;
}
if(valid22){
if(data42.end_date !== undefined){
let data47 = data42.end_date;
const _errs144 = errors;
const _errs145 = errors;
let valid24 = false;
const _errs146 = errors;
if(errors === _errs146){
if(errors === _errs146){
if(typeof data47 === "string"){
if(!(formats0.validate(data47))){
const err31 = {instancePath:instancePath+"/events/" + i2+"/end_date",schemaPath:"#/components/schemas/Event/properties/end_date/anyOf/0/format",keyword:"format",params:{format: "date"},message:"must match format \""+"date"+"\""};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
else {
const err32 = {instancePath:instancePath+"/events/" + i2+"/end_date",schemaPath:"#/components/schemas/Event/properties/end_date/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
}
}
var _valid10 = _errs146 === errors;
valid24 = valid24 || _valid10;
const _errs148 = errors;
if(data47 !== null){
const err33 = {instancePath:instancePath+"/events/" + i2+"/end_date",schemaPath:"#/components/schemas/Event/properties/end_date/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
var _valid10 = _errs148 === errors;
valid24 = valid24 || _valid10;
if(!valid24){
const err34 = {instancePath:instancePath+"/events/" + i2+"/end_date",schemaPath:"#/components/schemas/Event/properties/end_date/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
validate22.errors = vErrors;
return false;
}
else {
errors = _errs145;
if(vErrors !== null){
if(_errs145){
vErrors.length = _errs145;
}
else {
vErrors = null;
}
}
}
var valid22 = _errs144 === errors;
}
else {
var valid22 = true;
}
if(valid22){
if(data42.duration_days !== undefined){
let data48 = data42.duration_days;
const _errs150 = errors;
const _errs151 = errors;
let valid25 = false;
const _errs152 = errors;
if(!(((typeof data48 == "number") && (!(data48 % 1) && !isNaN(data48))) && (isFinite(data48)))){
const err35 = {instancePath:instancePath+"/events/" + i2+"/duration_days",schemaPath:"#/components/schemas/Event/properties/duration_days/anyOf/0/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
var _valid11 = _errs152 === errors;
valid25 = valid25 || _valid11;
const _errs154 = errors;
if(data48 !== null){
const err36 = {instancePath:instancePath+"/events/" + i2+"/duration_days",schemaPath:"#/components/schemas/Event/properties/duration_days/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
var _valid11 = _errs154 === errors;
valid25 = valid25 || _valid11;
if(!valid25){
const err37 = {instancePath:instancePath+"/events/" + i2+"/duration_days",schemaPath:"#/components/schemas/Event/properties/duration_days/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
validate22.errors = vErrors;
return false;
}
else {
errors = _errs151;
if(vErrors !== null){
if(_errs151){
vErrors.length = _errs151;
}
else {
vErrors = null;
}
}
}
var valid22 = _errs150 === errors;
}
else {
var valid22 = true;
}
if(valid22){
if(data42.peak_temperature_celsius !== undefined){
let data49 = data42.peak_temperature_celsius;
const _errs156 = errors;
const _errs157 = errors;
let valid26 = false;
const _errs158 = errors;
if(!((typeof data49 == "number") && (isFinite(data49)))){
const err38 = {instancePath:instancePath+"/events/" + i2+"/peak_temperature_celsius",schemaPath:"#/components/schemas/Event/properties/peak_temperature_celsius/anyOf/0/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
var _valid12 = _errs158 === errors;
valid26 = valid26 || _valid12;
const _errs160 = errors;
if(data49 !== null){
const err39 = {instancePath:instancePath+"/events/" + i2+"/peak_temperature_celsius",schemaPath:"#/components/schemas/Event/properties/peak_temperature_celsius/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
var _valid12 = _errs160 === errors;
valid26 = valid26 || _valid12;
if(!valid26){
const err40 = {instancePath:instancePath+"/events/" + i2+"/peak_temperature_celsius",schemaPath:"#/components/schemas/Event/properties/peak_temperature_celsius/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
validate22.errors = vErrors;
return false;
}
else {
errors = _errs157;
if(vErrors !== null){
if(_errs157){
vErrors.length = _errs157;
}
else {
vErrors = null;
}
}
}
var valid22 = _errs156 === errors;
}
else {
var valid22 = true;
}
if(valid22){
if(data42.mean_exceedance_celsius !== undefined){
let data50 = data42.mean_exceedance_celsius;
const _errs162 = errors;
const _errs163 = errors;
let valid27 = false;
const _errs164 = errors;
if(!((typeof data50 == "number") && (isFinite(data50)))){
const err41 = {instancePath:instancePath+"/events/" + i2+"/mean_exceedance_celsius",schemaPath:"#/components/schemas/Event/properties/mean_exceedance_celsius/anyOf/0/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
var _valid13 = _errs164 === errors;
valid27 = valid27 || _valid13;
const _errs166 = errors;
if(data50 !== null){
const err42 = {instancePath:instancePath+"/events/" + i2+"/mean_exceedance_celsius",schemaPath:"#/components/schemas/Event/properties/mean_exceedance_celsius/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
var _valid13 = _errs166 === errors;
valid27 = valid27 || _valid13;
if(!valid27){
const err43 = {instancePath:instancePath+"/events/" + i2+"/mean_exceedance_celsius",schemaPath:"#/components/schemas/Event/properties/mean_exceedance_celsius/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
validate22.errors = vErrors;
return false;
}
else {
errors = _errs163;
if(vErrors !== null){
if(_errs163){
vErrors.length = _errs163;
}
else {
vErrors = null;
}
}
}
var valid22 = _errs162 === errors;
}
else {
var valid22 = true;
}
if(valid22){
if(data42.observed_peak_temperature_celsius !== undefined){
let data51 = data42.observed_peak_temperature_celsius;
const _errs168 = errors;
if(!((typeof data51 == "number") && (isFinite(data51)))){
validate22.errors = [{instancePath:instancePath+"/events/" + i2+"/observed_peak_temperature_celsius",schemaPath:"#/components/schemas/Event/properties/observed_peak_temperature_celsius/type",keyword:"type",params:{type: "number"},message:"must be number"}];
return false;
}
var valid22 = _errs168 === errors;
}
else {
var valid22 = true;
}
if(valid22){
if(data42.observed_mean_exceedance_celsius !== undefined){
let data52 = data42.observed_mean_exceedance_celsius;
const _errs170 = errors;
if(!((typeof data52 == "number") && (isFinite(data52)))){
validate22.errors = [{instancePath:instancePath+"/events/" + i2+"/observed_mean_exceedance_celsius",schemaPath:"#/components/schemas/Event/properties/observed_mean_exceedance_celsius/type",keyword:"type",params:{type: "number"},message:"must be number"}];
return false;
}
var valid22 = _errs170 === errors;
}
else {
var valid22 = true;
}
if(valid22){
if(data42.truncated_start !== undefined){
const _errs172 = errors;
if(typeof data42.truncated_start !== "boolean"){
validate22.errors = [{instancePath:instancePath+"/events/" + i2+"/truncated_start",schemaPath:"#/components/schemas/Event/properties/truncated_start/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"}];
return false;
}
var valid22 = _errs172 === errors;
}
else {
var valid22 = true;
}
if(valid22){
if(data42.truncated_end !== undefined){
const _errs174 = errors;
if(typeof data42.truncated_end !== "boolean"){
validate22.errors = [{instancePath:instancePath+"/events/" + i2+"/truncated_end",schemaPath:"#/components/schemas/Event/properties/truncated_end/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"}];
return false;
}
var valid22 = _errs174 === errors;
}
else {
var valid22 = true;
}
if(valid22){
if(data42.qualification_confirmed !== undefined){
const _errs176 = errors;
if(typeof data42.qualification_confirmed !== "boolean"){
validate22.errors = [{instancePath:instancePath+"/events/" + i2+"/qualification_confirmed",schemaPath:"#/components/schemas/Event/properties/qualification_confirmed/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"}];
return false;
}
var valid22 = _errs176 === errors;
}
else {
var valid22 = true;
}
if(valid22){
if(data42.started_in_selection !== undefined){
let data56 = data42.started_in_selection;
const _errs178 = errors;
const _errs179 = errors;
let valid28 = false;
const _errs180 = errors;
if(typeof data56 !== "boolean"){
const err44 = {instancePath:instancePath+"/events/" + i2+"/started_in_selection",schemaPath:"#/components/schemas/Event/properties/started_in_selection/anyOf/0/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
var _valid14 = _errs180 === errors;
valid28 = valid28 || _valid14;
const _errs182 = errors;
if(data56 !== null){
const err45 = {instancePath:instancePath+"/events/" + i2+"/started_in_selection",schemaPath:"#/components/schemas/Event/properties/started_in_selection/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
var _valid14 = _errs182 === errors;
valid28 = valid28 || _valid14;
if(!valid28){
const err46 = {instancePath:instancePath+"/events/" + i2+"/started_in_selection",schemaPath:"#/components/schemas/Event/properties/started_in_selection/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
validate22.errors = vErrors;
return false;
}
else {
errors = _errs179;
if(vErrors !== null){
if(_errs179){
vErrors.length = _errs179;
}
else {
vErrors = null;
}
}
}
var valid22 = _errs178 === errors;
}
else {
var valid22 = true;
}
if(valid22){
if(data42.eligible_for_complete_metrics !== undefined){
const _errs184 = errors;
if(typeof data42.eligible_for_complete_metrics !== "boolean"){
validate22.errors = [{instancePath:instancePath+"/events/" + i2+"/eligible_for_complete_metrics",schemaPath:"#/components/schemas/Event/properties/eligible_for_complete_metrics/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"}];
return false;
}
var valid22 = _errs184 === errors;
}
else {
var valid22 = true;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
else {
validate22.errors = [{instancePath:instancePath+"/events/" + i2,schemaPath:"#/components/schemas/Event/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid20 = _errs128 === errors;
if(!valid20){
break;
}
}
}
else {
validate22.errors = [{instancePath:instancePath+"/events",schemaPath:"#/properties/events/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs126 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.insights !== undefined){
let data58 = data.insights;
const _errs186 = errors;
if(errors === _errs186){
if(Array.isArray(data58)){
var valid29 = true;
const len3 = data58.length;
for(let i3=0; i3<len3; i3++){
const _errs188 = errors;
if(typeof data58[i3] !== "string"){
validate22.errors = [{instancePath:instancePath+"/insights/" + i3,schemaPath:"#/properties/insights/items/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid29 = _errs188 === errors;
if(!valid29){
break;
}
}
}
else {
validate22.errors = [{instancePath:instancePath+"/insights",schemaPath:"#/properties/insights/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs186 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.data_quality !== undefined){
const _errs190 = errors;
if(!(validate31(data.data_quality, {instancePath:instancePath+"/data_quality",parentData:data,parentDataProperty:"data_quality",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate31.errors : vErrors.concat(validate31.errors);
errors = vErrors.length;
}
var valid0 = _errs190 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.source !== undefined){
const _errs191 = errors;
if(!(validate33(data.source, {instancePath:instancePath+"/source",parentData:data,parentDataProperty:"source",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate33.errors : vErrors.concat(validate33.errors);
errors = vErrors.length;
}
var valid0 = _errs191 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
}
}
}
else {
validate22.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate22.errors = vErrors;
return errors === 0;
}
validate22.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate20(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="validateAnalysisResponse" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate20.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(!(validate22(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate22.errors : vErrors.concat(validate22.errors);
errors = vErrors.length;
}
validate20.errors = vErrors;
return errors === 0;
}
validate20.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateRegionsResponse = validate38;
const schema53 = {"$id":"validateRegionsResponse","$ref":"handoff#/components/schemas/RegionsResponse"};
const schema54 = {"properties":{"regions":{"items":{"$ref":"#/components/schemas/Region"},"type":"array","title":"Regions"},"supported_years":{"$ref":"#/components/schemas/SupportedYears"},"defaults":{"$ref":"#/components/schemas/Selection"}},"type":"object","required":["regions"],"title":"RegionsResponse"};
const schema55 = {"properties":{"id":{"type":"string","enum":["delhi","mumbai","bengaluru","chennai","hyderabad"],"title":"Id"},"name":{"type":"string","title":"Name"},"latitude":{"type":"number","title":"Latitude"},"longitude":{"type":"number","title":"Longitude"},"timezone":{"type":"string","title":"Timezone"}},"type":"object","required":["id","name","latitude","longitude","timezone"],"title":"Region"};
const schema56 = {"properties":{"min":{"type":"integer","title":"Min","default":1990},"max":{"type":"integer","title":"Max","default":2025}},"type":"object","title":"SupportedYears"};
const schema57 = {"properties":{"region_id":{"type":"string","enum":["delhi","mumbai","bengaluru","chennai","hyderabad"],"title":"Region Id","default":"delhi"},"start_year":{"type":"integer","maximum":2025,"minimum":1990,"title":"Start Year","default":1990},"end_year":{"type":"integer","maximum":2025,"minimum":1990,"title":"End Year","default":2020},"hazard":{"type":"string","const":"heatwave","title":"Hazard","default":"heatwave"}},"additionalProperties":false,"type":"object","title":"Selection"};

function validate39(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate39.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((data.regions === undefined) && (missing0 = "regions")){
validate39.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
if(data.regions !== undefined){
let data0 = data.regions;
const _errs1 = errors;
if(errors === _errs1){
if(Array.isArray(data0)){
var valid1 = true;
const len0 = data0.length;
for(let i0=0; i0<len0; i0++){
let data1 = data0[i0];
const _errs3 = errors;
const _errs4 = errors;
if(errors === _errs4){
if(data1 && typeof data1 == "object" && !Array.isArray(data1)){
let missing1;
if((((((data1.id === undefined) && (missing1 = "id")) || ((data1.name === undefined) && (missing1 = "name"))) || ((data1.latitude === undefined) && (missing1 = "latitude"))) || ((data1.longitude === undefined) && (missing1 = "longitude"))) || ((data1.timezone === undefined) && (missing1 = "timezone"))){
validate39.errors = [{instancePath:instancePath+"/regions/" + i0,schemaPath:"#/components/schemas/Region/required",keyword:"required",params:{missingProperty: missing1},message:"must have required property '"+missing1+"'"}];
return false;
}
else {
if(data1.id !== undefined){
let data2 = data1.id;
const _errs6 = errors;
if(typeof data2 !== "string"){
validate39.errors = [{instancePath:instancePath+"/regions/" + i0+"/id",schemaPath:"#/components/schemas/Region/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!(((((data2 === "delhi") || (data2 === "mumbai")) || (data2 === "bengaluru")) || (data2 === "chennai")) || (data2 === "hyderabad"))){
validate39.errors = [{instancePath:instancePath+"/regions/" + i0+"/id",schemaPath:"#/components/schemas/Region/properties/id/enum",keyword:"enum",params:{allowedValues: schema55.properties.id.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid3 = _errs6 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data1.name !== undefined){
const _errs8 = errors;
if(typeof data1.name !== "string"){
validate39.errors = [{instancePath:instancePath+"/regions/" + i0+"/name",schemaPath:"#/components/schemas/Region/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid3 = _errs8 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data1.latitude !== undefined){
let data4 = data1.latitude;
const _errs10 = errors;
if(!((typeof data4 == "number") && (isFinite(data4)))){
validate39.errors = [{instancePath:instancePath+"/regions/" + i0+"/latitude",schemaPath:"#/components/schemas/Region/properties/latitude/type",keyword:"type",params:{type: "number"},message:"must be number"}];
return false;
}
var valid3 = _errs10 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data1.longitude !== undefined){
let data5 = data1.longitude;
const _errs12 = errors;
if(!((typeof data5 == "number") && (isFinite(data5)))){
validate39.errors = [{instancePath:instancePath+"/regions/" + i0+"/longitude",schemaPath:"#/components/schemas/Region/properties/longitude/type",keyword:"type",params:{type: "number"},message:"must be number"}];
return false;
}
var valid3 = _errs12 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data1.timezone !== undefined){
const _errs14 = errors;
if(typeof data1.timezone !== "string"){
validate39.errors = [{instancePath:instancePath+"/regions/" + i0+"/timezone",schemaPath:"#/components/schemas/Region/properties/timezone/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid3 = _errs14 === errors;
}
else {
var valid3 = true;
}
}
}
}
}
}
}
else {
validate39.errors = [{instancePath:instancePath+"/regions/" + i0,schemaPath:"#/components/schemas/Region/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid1 = _errs3 === errors;
if(!valid1){
break;
}
}
}
else {
validate39.errors = [{instancePath:instancePath+"/regions",schemaPath:"#/properties/regions/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs1 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.supported_years !== undefined){
let data7 = data.supported_years;
const _errs16 = errors;
const _errs17 = errors;
if(errors === _errs17){
if(data7 && typeof data7 == "object" && !Array.isArray(data7)){
if(data7.min !== undefined){
let data8 = data7.min;
const _errs19 = errors;
if(!(((typeof data8 == "number") && (!(data8 % 1) && !isNaN(data8))) && (isFinite(data8)))){
validate39.errors = [{instancePath:instancePath+"/supported_years/min",schemaPath:"#/components/schemas/SupportedYears/properties/min/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid5 = _errs19 === errors;
}
else {
var valid5 = true;
}
if(valid5){
if(data7.max !== undefined){
let data9 = data7.max;
const _errs21 = errors;
if(!(((typeof data9 == "number") && (!(data9 % 1) && !isNaN(data9))) && (isFinite(data9)))){
validate39.errors = [{instancePath:instancePath+"/supported_years/max",schemaPath:"#/components/schemas/SupportedYears/properties/max/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid5 = _errs21 === errors;
}
else {
var valid5 = true;
}
}
}
else {
validate39.errors = [{instancePath:instancePath+"/supported_years",schemaPath:"#/components/schemas/SupportedYears/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid0 = _errs16 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.defaults !== undefined){
let data10 = data.defaults;
const _errs23 = errors;
const _errs24 = errors;
if(errors === _errs24){
if(data10 && typeof data10 == "object" && !Array.isArray(data10)){
const _errs26 = errors;
for(const key0 in data10){
if(!((((key0 === "region_id") || (key0 === "start_year")) || (key0 === "end_year")) || (key0 === "hazard"))){
validate39.errors = [{instancePath:instancePath+"/defaults",schemaPath:"#/components/schemas/Selection/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs26 === errors){
if(data10.region_id !== undefined){
let data11 = data10.region_id;
const _errs27 = errors;
if(typeof data11 !== "string"){
validate39.errors = [{instancePath:instancePath+"/defaults/region_id",schemaPath:"#/components/schemas/Selection/properties/region_id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!(((((data11 === "delhi") || (data11 === "mumbai")) || (data11 === "bengaluru")) || (data11 === "chennai")) || (data11 === "hyderabad"))){
validate39.errors = [{instancePath:instancePath+"/defaults/region_id",schemaPath:"#/components/schemas/Selection/properties/region_id/enum",keyword:"enum",params:{allowedValues: schema57.properties.region_id.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid7 = _errs27 === errors;
}
else {
var valid7 = true;
}
if(valid7){
if(data10.start_year !== undefined){
let data12 = data10.start_year;
const _errs29 = errors;
if(!(((typeof data12 == "number") && (!(data12 % 1) && !isNaN(data12))) && (isFinite(data12)))){
validate39.errors = [{instancePath:instancePath+"/defaults/start_year",schemaPath:"#/components/schemas/Selection/properties/start_year/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs29){
if((typeof data12 == "number") && (isFinite(data12))){
if(data12 > 2025 || isNaN(data12)){
validate39.errors = [{instancePath:instancePath+"/defaults/start_year",schemaPath:"#/components/schemas/Selection/properties/start_year/maximum",keyword:"maximum",params:{comparison: "<=", limit: 2025},message:"must be <= 2025"}];
return false;
}
else {
if(data12 < 1990 || isNaN(data12)){
validate39.errors = [{instancePath:instancePath+"/defaults/start_year",schemaPath:"#/components/schemas/Selection/properties/start_year/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1990},message:"must be >= 1990"}];
return false;
}
}
}
}
var valid7 = _errs29 === errors;
}
else {
var valid7 = true;
}
if(valid7){
if(data10.end_year !== undefined){
let data13 = data10.end_year;
const _errs31 = errors;
if(!(((typeof data13 == "number") && (!(data13 % 1) && !isNaN(data13))) && (isFinite(data13)))){
validate39.errors = [{instancePath:instancePath+"/defaults/end_year",schemaPath:"#/components/schemas/Selection/properties/end_year/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs31){
if((typeof data13 == "number") && (isFinite(data13))){
if(data13 > 2025 || isNaN(data13)){
validate39.errors = [{instancePath:instancePath+"/defaults/end_year",schemaPath:"#/components/schemas/Selection/properties/end_year/maximum",keyword:"maximum",params:{comparison: "<=", limit: 2025},message:"must be <= 2025"}];
return false;
}
else {
if(data13 < 1990 || isNaN(data13)){
validate39.errors = [{instancePath:instancePath+"/defaults/end_year",schemaPath:"#/components/schemas/Selection/properties/end_year/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1990},message:"must be >= 1990"}];
return false;
}
}
}
}
var valid7 = _errs31 === errors;
}
else {
var valid7 = true;
}
if(valid7){
if(data10.hazard !== undefined){
let data14 = data10.hazard;
const _errs33 = errors;
if(typeof data14 !== "string"){
validate39.errors = [{instancePath:instancePath+"/defaults/hazard",schemaPath:"#/components/schemas/Selection/properties/hazard/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if("heatwave" !== data14){
validate39.errors = [{instancePath:instancePath+"/defaults/hazard",schemaPath:"#/components/schemas/Selection/properties/hazard/const",keyword:"const",params:{allowedValue: "heatwave"},message:"must be equal to constant"}];
return false;
}
var valid7 = _errs33 === errors;
}
else {
var valid7 = true;
}
}
}
}
}
}
else {
validate39.errors = [{instancePath:instancePath+"/defaults",schemaPath:"#/components/schemas/Selection/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid0 = _errs23 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
else {
validate39.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate39.errors = vErrors;
return errors === 0;
}
validate39.evaluated = {"props":{"regions":true,"supported_years":true,"defaults":true},"dynamicProps":false,"dynamicItems":false};


function validate38(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="validateRegionsResponse" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate38.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(!(validate39(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate39.errors : vErrors.concat(validate39.errors);
errors = vErrors.length;
}
validate38.errors = vErrors;
return errors === 0;
}
validate38.evaluated = {"props":{"regions":true,"supported_years":true,"defaults":true},"dynamicProps":false,"dynamicItems":false};

export const validateSelection = validate41;
const schema58 = {"$id":"validateSelection","$ref":"handoff#/components/schemas/Selection"};

function validate41(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="validateSelection" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate41.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
const _errs0 = errors;
if(errors === _errs0){
if(data && typeof data == "object" && !Array.isArray(data)){
const _errs2 = errors;
for(const key0 in data){
if(!((((key0 === "region_id") || (key0 === "start_year")) || (key0 === "end_year")) || (key0 === "hazard"))){
validate41.errors = [{instancePath,schemaPath:"handoff#/components/schemas/Selection/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs2 === errors){
if(data.region_id !== undefined){
let data0 = data.region_id;
const _errs3 = errors;
if(typeof data0 !== "string"){
validate41.errors = [{instancePath:instancePath+"/region_id",schemaPath:"handoff#/components/schemas/Selection/properties/region_id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!(((((data0 === "delhi") || (data0 === "mumbai")) || (data0 === "bengaluru")) || (data0 === "chennai")) || (data0 === "hyderabad"))){
validate41.errors = [{instancePath:instancePath+"/region_id",schemaPath:"handoff#/components/schemas/Selection/properties/region_id/enum",keyword:"enum",params:{allowedValues: schema57.properties.region_id.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid1 = _errs3 === errors;
}
else {
var valid1 = true;
}
if(valid1){
if(data.start_year !== undefined){
let data1 = data.start_year;
const _errs5 = errors;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
validate41.errors = [{instancePath:instancePath+"/start_year",schemaPath:"handoff#/components/schemas/Selection/properties/start_year/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs5){
if((typeof data1 == "number") && (isFinite(data1))){
if(data1 > 2025 || isNaN(data1)){
validate41.errors = [{instancePath:instancePath+"/start_year",schemaPath:"handoff#/components/schemas/Selection/properties/start_year/maximum",keyword:"maximum",params:{comparison: "<=", limit: 2025},message:"must be <= 2025"}];
return false;
}
else {
if(data1 < 1990 || isNaN(data1)){
validate41.errors = [{instancePath:instancePath+"/start_year",schemaPath:"handoff#/components/schemas/Selection/properties/start_year/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1990},message:"must be >= 1990"}];
return false;
}
}
}
}
var valid1 = _errs5 === errors;
}
else {
var valid1 = true;
}
if(valid1){
if(data.end_year !== undefined){
let data2 = data.end_year;
const _errs7 = errors;
if(!(((typeof data2 == "number") && (!(data2 % 1) && !isNaN(data2))) && (isFinite(data2)))){
validate41.errors = [{instancePath:instancePath+"/end_year",schemaPath:"handoff#/components/schemas/Selection/properties/end_year/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs7){
if((typeof data2 == "number") && (isFinite(data2))){
if(data2 > 2025 || isNaN(data2)){
validate41.errors = [{instancePath:instancePath+"/end_year",schemaPath:"handoff#/components/schemas/Selection/properties/end_year/maximum",keyword:"maximum",params:{comparison: "<=", limit: 2025},message:"must be <= 2025"}];
return false;
}
else {
if(data2 < 1990 || isNaN(data2)){
validate41.errors = [{instancePath:instancePath+"/end_year",schemaPath:"handoff#/components/schemas/Selection/properties/end_year/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1990},message:"must be >= 1990"}];
return false;
}
}
}
}
var valid1 = _errs7 === errors;
}
else {
var valid1 = true;
}
if(valid1){
if(data.hazard !== undefined){
let data3 = data.hazard;
const _errs9 = errors;
if(typeof data3 !== "string"){
validate41.errors = [{instancePath:instancePath+"/hazard",schemaPath:"handoff#/components/schemas/Selection/properties/hazard/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if("heatwave" !== data3){
validate41.errors = [{instancePath:instancePath+"/hazard",schemaPath:"handoff#/components/schemas/Selection/properties/hazard/const",keyword:"const",params:{allowedValue: "heatwave"},message:"must be equal to constant"}];
return false;
}
var valid1 = _errs9 === errors;
}
else {
var valid1 = true;
}
}
}
}
}
}
else {
validate41.errors = [{instancePath,schemaPath:"handoff#/components/schemas/Selection/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate41.errors = vErrors;
return errors === 0;
}
validate41.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateErrorResponse = validate42;
const schema60 = {"$id":"validateErrorResponse","$ref":"handoff#/components/schemas/ErrorResponse"};
const schema61 = {"properties":{"error":{"$ref":"#/components/schemas/ErrorBody"}},"type":"object","required":["error"],"title":"ErrorResponse"};
const schema62 = {"properties":{"code":{"type":"string","title":"Code"},"message":{"type":"string","title":"Message"},"details":{"anyOf":[{"items":{"$ref":"#/components/schemas/ValidationDetail"},"type":"array"},{"type":"null"}],"title":"Details"}},"type":"object","required":["code","message"],"title":"ErrorBody"};
const schema63 = {"properties":{"field":{"type":"string","title":"Field"},"code":{"type":"string","title":"Code"},"message":{"type":"string","title":"Message"}},"type":"object","required":["field","code","message"],"title":"ValidationDetail"};

function validate44(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate44.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((data.code === undefined) && (missing0 = "code")) || ((data.message === undefined) && (missing0 = "message"))){
validate44.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
if(data.code !== undefined){
const _errs1 = errors;
if(typeof data.code !== "string"){
validate44.errors = [{instancePath:instancePath+"/code",schemaPath:"#/properties/code/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs1 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.message !== undefined){
const _errs3 = errors;
if(typeof data.message !== "string"){
validate44.errors = [{instancePath:instancePath+"/message",schemaPath:"#/properties/message/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs3 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.details !== undefined){
let data2 = data.details;
const _errs5 = errors;
const _errs6 = errors;
let valid1 = false;
const _errs7 = errors;
if(errors === _errs7){
if(Array.isArray(data2)){
var valid2 = true;
const len0 = data2.length;
for(let i0=0; i0<len0; i0++){
let data3 = data2[i0];
const _errs9 = errors;
const _errs10 = errors;
if(errors === _errs10){
if(data3 && typeof data3 == "object" && !Array.isArray(data3)){
let missing1;
if((((data3.field === undefined) && (missing1 = "field")) || ((data3.code === undefined) && (missing1 = "code"))) || ((data3.message === undefined) && (missing1 = "message"))){
const err0 = {instancePath:instancePath+"/details/" + i0,schemaPath:"#/components/schemas/ValidationDetail/required",keyword:"required",params:{missingProperty: missing1},message:"must have required property '"+missing1+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
else {
if(data3.field !== undefined){
const _errs12 = errors;
if(typeof data3.field !== "string"){
const err1 = {instancePath:instancePath+"/details/" + i0+"/field",schemaPath:"#/components/schemas/ValidationDetail/properties/field/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
var valid4 = _errs12 === errors;
}
else {
var valid4 = true;
}
if(valid4){
if(data3.code !== undefined){
const _errs14 = errors;
if(typeof data3.code !== "string"){
const err2 = {instancePath:instancePath+"/details/" + i0+"/code",schemaPath:"#/components/schemas/ValidationDetail/properties/code/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
var valid4 = _errs14 === errors;
}
else {
var valid4 = true;
}
if(valid4){
if(data3.message !== undefined){
const _errs16 = errors;
if(typeof data3.message !== "string"){
const err3 = {instancePath:instancePath+"/details/" + i0+"/message",schemaPath:"#/components/schemas/ValidationDetail/properties/message/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
var valid4 = _errs16 === errors;
}
else {
var valid4 = true;
}
}
}
}
}
else {
const err4 = {instancePath:instancePath+"/details/" + i0,schemaPath:"#/components/schemas/ValidationDetail/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
var valid2 = _errs9 === errors;
if(!valid2){
break;
}
}
}
else {
const err5 = {instancePath:instancePath+"/details",schemaPath:"#/properties/details/anyOf/0/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
var _valid0 = _errs7 === errors;
valid1 = valid1 || _valid0;
const _errs18 = errors;
if(data2 !== null){
const err6 = {instancePath:instancePath+"/details",schemaPath:"#/properties/details/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
var _valid0 = _errs18 === errors;
valid1 = valid1 || _valid0;
if(!valid1){
const err7 = {instancePath:instancePath+"/details",schemaPath:"#/properties/details/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
validate44.errors = vErrors;
return false;
}
else {
errors = _errs6;
if(vErrors !== null){
if(_errs6){
vErrors.length = _errs6;
}
else {
vErrors = null;
}
}
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
else {
validate44.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate44.errors = vErrors;
return errors === 0;
}
validate44.evaluated = {"props":{"code":true,"message":true,"details":true},"dynamicProps":false,"dynamicItems":false};


function validate43(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate43.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((data.error === undefined) && (missing0 = "error")){
validate43.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
if(data.error !== undefined){
if(!(validate44(data.error, {instancePath:instancePath+"/error",parentData:data,parentDataProperty:"error",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate44.errors : vErrors.concat(validate44.errors);
errors = vErrors.length;
}
}
}
}
else {
validate43.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate43.errors = vErrors;
return errors === 0;
}
validate43.evaluated = {"props":{"error":true},"dynamicProps":false,"dynamicItems":false};


function validate42(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="validateErrorResponse" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate42.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(!(validate43(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
errors = vErrors.length;
}
validate42.errors = vErrors;
return errors === 0;
}
validate42.evaluated = {"props":{"error":true},"dynamicProps":false,"dynamicItems":false};
