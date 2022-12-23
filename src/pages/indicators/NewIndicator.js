import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import styled from "@emotion/styled";
import {
  Box,
  Breadcrumbs as MuiBreadcrumbs,
  Button as MuiButton,
  Card as MuiCard,
  CardContent as MuiCardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider as MuiDivider,
  FormControl as MuiFormControl,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  OutlinedInput,
  Paper as MuiPaper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField as MuiTextField,
  Typography,
} from "@mui/material";
import { spacing } from "@mui/system";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { NavLink, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getAdministrativeProgrammeById,
  newAdministrativeProgramme,
} from "../../api/administrative-programme";
import { getLookupMasterItemsByName } from "../../api/lookup";
import { Guid } from "../../utils/guid";
import { getAllIndicators, newIndicator } from "../../api/indicator";
import { getProgrammes } from "../../api/programmes";
import {
  getProgrammeThematicAreaSubThemes,
  GetUniqueSubThemesByThematicAreaId,
  GetUniqueThematicAreasByProgrammeId,
} from "../../api/programme-thematic-area-sub-theme";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { getAllAggregates } from "../../api/aggregate";
import { getAggregateDisaggregates } from "../../api/aggregate-disaggregate";

const Card = styled(MuiCard)(spacing);
const Divider = styled(MuiDivider)(spacing);
const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);
const CardContent = styled(MuiCardContent)(spacing);
const TextField = styled(MuiTextField)(spacing);
const Button = styled(MuiButton)(spacing);
const Paper = styled(MuiPaper)(spacing);
const FormControl = styled(MuiFormControl)(spacing);

const theme = createTheme({
  palette: {
    neutral: {
      main: "#64748B",
      contrastText: "#fff",
    },
  },
});

const aggregateInitial = {
  indicatorAggregateId: "",
  indicatorAggregateDisaggregateId: "",
  indicatorSecondaryAggregateId: "",
  indicatorSecondaryAggregateDisaggregateId: [],
};

const subThemeInitial = {
  indicatorProgrammeId: "",
  indicatorThematicAreaId: "",
  indicatorSubThemeId: "",
};

const initialValues = {
  name: "",
  code: "",
  indicatorTypeId: "",
  indicatorCalculationId: "",
  definition: "",
  indicatorMeasure: "",
  numeratorId: "",
  denominatorId: "",
  indicatorCumulative: "",
};

const AggregateDisAggregateForm = ({ handleClickAggregate }) => {
  const [aggregateId, setAggregateId] = useState();
  const [secondaryAggregateId, setSecondaryAggregateId] = useState();
  const { data: aggregatesData, isLoading: isLoadingAggregates } = useQuery(
    ["getAllAggregates"],
    getAllAggregates
  );
  const {
    data: aggregateDisaggregatesData,
    isLoading: isLoadingAggregateDisaggregates,
    isError: isErrorAggregateDisaggregates,
  } = useQuery(
    ["getAggregateDisaggregates", aggregateId],
    getAggregateDisaggregates,
    {
      enabled: !!aggregateId,
    }
  );

  const {
    data: secondaryAggregateDisaggregatesData,
    isLoading: isLoadingSecondaryAggregateDisaggregates,
    isError: isErrorSecondaryAggregateDisaggregates,
  } = useQuery(
    ["getSecondaryAggregateDisaggregates", secondaryAggregateId],
    getAggregateDisaggregates,
    {
      enabled: !!secondaryAggregateId,
    }
  );
  const formik = useFormik({
    initialValues: aggregateInitial,
    validationSchema: Yup.object().shape({
      indicatorAggregateId: Yup.object().required("Required"),
      indicatorAggregateDisaggregateId: Yup.object().required("Required"),
      indicatorSecondaryAggregateId: Yup.object().required("Required"),
      indicatorSecondaryAggregateDisaggregateId:
        Yup.array().required("Required"),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        handleClickAggregate(values);
      } catch (error) {
        toast(error.response.data, {
          type: "error",
        });
      } finally {
        resetForm();
        setSubmitting(false);
      }
    },
  });

  const onSelectedAggregate = (e) => {
    setAggregateId(e.target.value.id);
  };

  const onSelectedSecondaryAggregate = (e) => {
    setSecondaryAggregateId(e.target.value.id);
  };

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    formik.setFieldValue("indicatorSecondaryAggregateDisaggregateId", value);
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card mb={12}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item md={3}>
              <TextField
                name="indicatorAggregateId"
                label="Aggregate"
                required
                select
                value={formik.values.indicatorAggregateId}
                error={Boolean(
                  formik.touched.indicatorAggregateId &&
                    formik.errors.indicatorAggregateId
                )}
                fullWidth
                helperText={
                  formik.touched.indicatorAggregateId &&
                  formik.errors.indicatorAggregateId
                }
                onBlur={formik.handleBlur}
                onChange={(e) => {
                  formik.handleChange(e);
                  onSelectedAggregate(e);
                }}
                variant="outlined"
                my={2}
              >
                <MenuItem disabled value="">
                  Select Aggregate
                </MenuItem>
                {!isLoadingAggregates
                  ? aggregatesData.data.map((option) => (
                      <MenuItem key={option.id} value={option}>
                        {option.name}
                      </MenuItem>
                    ))
                  : []}
              </TextField>
            </Grid>
            <Grid item md={3}>
              <TextField
                name="indicatorAggregateDisaggregateId"
                label="Aggregate Disaggregate"
                required
                select
                value={formik.values.indicatorAggregateDisaggregateId}
                error={Boolean(
                  formik.touched.indicatorAggregateDisaggregateId &&
                    formik.errors.indicatorAggregateDisaggregateId
                )}
                fullWidth
                helperText={
                  formik.touched.indicatorAggregateDisaggregateId &&
                  formik.errors.indicatorAggregateDisaggregateId
                }
                onBlur={formik.handleBlur}
                onChange={(e) => {
                  formik.handleChange(e);
                }}
                variant="outlined"
                my={2}
              >
                <MenuItem disabled value="">
                  Select Aggregate Disaggregate
                </MenuItem>
                {!isLoadingAggregateDisaggregates &&
                !isErrorAggregateDisaggregates
                  ? aggregateDisaggregatesData.data.map((option) => (
                      <MenuItem key={option.id} value={option}>
                        {option.disaggregate.name}
                      </MenuItem>
                    ))
                  : []}
              </TextField>
            </Grid>
            <Grid item md={3}>
              <TextField
                name="indicatorSecondaryAggregateId"
                label="Secondary Aggregate"
                required
                select
                value={formik.values.indicatorSecondaryAggregateId}
                error={Boolean(
                  formik.touched.indicatorSecondaryAggregateId &&
                    formik.errors.indicatorSecondaryAggregateId
                )}
                fullWidth
                helperText={
                  formik.touched.indicatorSecondaryAggregateId &&
                  formik.errors.indicatorSecondaryAggregateId
                }
                onBlur={formik.handleBlur}
                onChange={(e) => {
                  formik.handleChange(e);
                  onSelectedSecondaryAggregate(e);
                }}
                variant="outlined"
                my={2}
              >
                <MenuItem disabled value="">
                  Select Secondary Aggregate
                </MenuItem>
                {!isLoadingAggregates
                  ? aggregatesData.data.map((option) => (
                      <MenuItem key={option.id} value={option}>
                        {option.name}
                      </MenuItem>
                    ))
                  : []}
              </TextField>
            </Grid>
            <Grid item md={3}>
              <FormControl fullWidth my={2} variant="outlined">
                <InputLabel id="indicatorSecondaryAggregateDisaggregateId">
                  Select Secondary Aggregate Disaggregate
                </InputLabel>
                <Select
                  labelId="indicatorSecondaryAggregateDisaggregateId"
                  id="indicatorSecondaryAggregateDisaggregateId"
                  multiple
                  value={
                    formik.values.indicatorSecondaryAggregateDisaggregateId
                  }
                  onChange={(e) => {
                    formik.handleChange(e);
                    handleChange(e);
                  }}
                  input={
                    <OutlinedInput
                      id="select-multiple-chip"
                      label="Select Secondary Aggregate Disaggregate"
                    />
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value.disaggregate.id}
                          label={value.disaggregate.name}
                        />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem disabled value="">
                    Select Secondary Aggregate Disaggregate
                  </MenuItem>
                  {!isLoadingSecondaryAggregateDisaggregates &&
                  !isErrorSecondaryAggregateDisaggregates
                    ? secondaryAggregateDisaggregatesData.data.map((option) => (
                        <MenuItem key={option.id} value={option}>
                          {option.disaggregate.name}
                        </MenuItem>
                      ))
                    : []}
                </Select>
              </FormControl>
            </Grid>
            <Grid item md={3}>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                mt={3}
              >
                Add
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </form>
  );
};

const IndicatorProgrammesForm = ({ handleClick }) => {
  const [indicatorProgrammeId, setIndicatorProgrammeId] = useState();
  const [thematicAreaId, setThematicAreaId] = useState();

  const { data: programmesData, isLoading: isLoadingProgrammes } = useQuery(
    ["getProgrammes"],
    getProgrammes
  );
  const {
    data: thematicAreasData,
    isLoading: isLoadingThematicAreas,
    isError,
  } = useQuery(
    ["GetUniqueThematicAreasByProgrammeId", indicatorProgrammeId],
    GetUniqueThematicAreasByProgrammeId,
    { enabled: !!indicatorProgrammeId }
  );
  const {
    data: subThemesData,
    isLoading: isLoadingSubThemes,
    isError: isErrorSubThemes,
  } = useQuery(
    [
      "GetUniqueSubThemesByThematicAreaId",
      indicatorProgrammeId,
      thematicAreaId,
    ],
    GetUniqueSubThemesByThematicAreaId,
    { enabled: !!indicatorProgrammeId && !!thematicAreaId }
  );
  const formik = useFormik({
    initialValues: subThemeInitial,
    validationSchema: Yup.object().shape({
      indicatorProgrammeId: Yup.object().required("Required"),
      indicatorThematicAreaId: Yup.object().required("Required"),
      indicatorSubThemeId: Yup.object().required("Required"),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        handleClick(values);
      } catch (error) {
        toast(error.response.data, {
          type: "error",
        });
      } finally {
        resetForm();
        setSubmitting(false);
      }
    },
  });

  const onProgrammeSelected = (e) => {
    setIndicatorProgrammeId(e.target.value.id);
    formik.setFieldValue("indicatorThematicAreaId", "");
    formik.setFieldValue("indicatorSubThemeId", "");
  };

  const onThematicAreaSelected = (e) => {
    setThematicAreaId(e.target.value.id);
    formik.setFieldValue("indicatorSubThemeId", "");
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card mb={12}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item md={3}>
              <TextField
                name="indicatorProgrammeId"
                label="Programme"
                required
                select
                value={formik.values.indicatorProgrammeId}
                error={Boolean(
                  formik.touched.indicatorProgrammeId &&
                    formik.errors.indicatorProgrammeId
                )}
                fullWidth
                helperText={
                  formik.touched.indicatorProgrammeId &&
                  formik.errors.indicatorProgrammeId
                }
                onBlur={formik.handleBlur}
                onChange={(e) => {
                  formik.handleChange(e);
                  onProgrammeSelected(e);
                }}
                variant="outlined"
                my={2}
              >
                <MenuItem disabled value="">
                  Select Programme
                </MenuItem>
                {!isLoadingProgrammes
                  ? programmesData.data.map((option) => (
                      <MenuItem key={option.id} value={option}>
                        {option.code + " - " + option.name}
                      </MenuItem>
                    ))
                  : []}
              </TextField>
            </Grid>
            <Grid item md={3}>
              <TextField
                name="indicatorThematicAreaId"
                label="Thematic Area"
                required
                select
                value={formik.values.indicatorThematicAreaId}
                error={Boolean(
                  formik.touched.indicatorThematicAreaId &&
                    formik.errors.indicatorThematicAreaId
                )}
                fullWidth
                helperText={
                  formik.touched.indicatorThematicAreaId &&
                  formik.errors.indicatorThematicAreaId
                }
                onBlur={formik.handleBlur}
                onChange={(e) => {
                  formik.handleChange(e);
                  onThematicAreaSelected(e);
                }}
                variant="outlined"
                my={2}
              >
                <MenuItem disabled value="">
                  Select Thematic Area
                </MenuItem>
                {!isLoadingThematicAreas && !isError
                  ? thematicAreasData.data.map((option) => (
                      <MenuItem key={option.id} value={option}>
                        {option.code + " - " + option.name}
                      </MenuItem>
                    ))
                  : []}
              </TextField>
            </Grid>
            <Grid item md={3}>
              <TextField
                name="indicatorSubThemeId"
                label="Sub Theme"
                required
                select
                value={formik.values.indicatorSubThemeId}
                error={Boolean(
                  formik.touched.indicatorSubThemeId &&
                    formik.errors.indicatorSubThemeId
                )}
                fullWidth
                helperText={
                  formik.touched.indicatorSubThemeId &&
                  formik.errors.indicatorSubThemeId
                }
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                variant="outlined"
                my={2}
              >
                <MenuItem disabled value="">
                  Select Sub Theme
                </MenuItem>
                {!isLoadingSubThemes && !isErrorSubThemes
                  ? subThemesData.data.map((option) => (
                      <MenuItem key={option.id} value={option}>
                        {option.code + " - " + option.name}
                      </MenuItem>
                    ))
                  : []}
              </TextField>
            </Grid>
            <Grid item md={3}>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                mt={3}
              >
                Add
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </form>
  );
};

const NewIndicatorForm = () => {
  let { id } = useParams();
  const [open, setOpen] = useState(false);
  const [openAggregate, setOpenAggregate] = useState(false);
  const [subThemesArray, setSubThemesArray] = useState([]);
  const [aggregateDisAggregateArray, setAggregateDisAggregateArray] = useState(
    []
  );
  const { data: OrganizationUnitData } = useQuery(
    ["getAdministrativeProgrammeById", id],
    getAdministrativeProgrammeById,
    {
      refetchOnWindowFocus: false,
      enabled: !!id,
    }
  );
  // fetch all indicators
  const { data, isLoading } = useQuery(["getAllIndicators"], getAllIndicators, {
    retry: 0,
  });
  // fetch IndicatorType Lookup
  const { data: indicatorTypeData, isLoading: isLoadingIndicatorType } =
    useQuery(["IndicatorType", "IndicatorType"], getLookupMasterItemsByName, {
      refetchOnWindowFocus: false,
    });
  // fetch IndicatorMeasure Lookup
  const { data: indicatorMeasureData, isLoading: isLoadingIndicatorMeasure } =
    useQuery(
      ["IndicatorMeasure", "IndicatorMeasure"],
      getLookupMasterItemsByName,
      {
        refetchOnWindowFocus: false,
      }
    );
  // fetch YesNo Lookup
  const { data: yesNoData, isLoading: isLoadingYesNo } = useQuery(
    ["YesNo", "YesNo"],
    getLookupMasterItemsByName,
    {
      refetchOnWindowFocus: false,
    }
  );
  const mutation = useMutation({ mutationFn: newIndicator });

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: Yup.object().shape({
      name: Yup.string().required("Required"),
      code: Yup.string().required("Required"),
      indicatorTypeId: Yup.string().required("Required"),
      indicatorCalculationId: Yup.string().required("Required"),
      definition: Yup.string().required("Required"),
      indicatorMeasure: Yup.string().required("Required"),
      numeratorId: Yup.string().required("Required"),
      denominatorId: Yup.string().required("Required"),
      indicatorCumulative: Yup.string().required("Required"),
      indicatorProgrammeId: Yup.object().required("Required"),
      indicatorThematicAreaId: Yup.string().required("Required"),
      indicatorSubThemeId: Yup.string().required("Required"),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      values.createDate = new Date();
      if (id) {
        values.id = id;
      } else {
        values.id = new Guid().toString();
      }
      try {
        await mutation.mutateAsync(values);
      } catch (error) {
        toast(error.response.data, {
          type: "error",
        });
      } finally {
        resetForm();
        setSubmitting(false);
      }
    },
  });
  useEffect(() => {
    function setCurrentFormValues() {
      // if (OrganizationUnitData) {
      //   formik.setValues({
      //     shortTitle: OrganizationUnitData.data.shortTitle,
      //     longTitle: OrganizationUnitData.data.longTitle,
      //     description: OrganizationUnitData.data.description,
      //     goal: OrganizationUnitData.data.goal,
      //     organisationUnitId: OrganizationUnitData.data.organisationUnitId,
      //     managerName:
      //       managerName && managerName.length > 0 ? managerName[0] : "",
      //     managerEmail: OrganizationUnitData.data.managerEmail,
      //   });
      // }
    }
    setCurrentFormValues();
  }, []);

  const handleClick = (values) => {
    const res = subThemesArray.find(
      (obj) =>
        obj &&
        obj.indicatorProgrammeId.id === values.indicatorProgrammeId.id &&
        obj.indicatorThematicAreaId.id === values.indicatorThematicAreaId.id &&
        obj.indicatorSubThemeId.id === values.indicatorSubThemeId.id
    );
    if (!res) {
      setSubThemesArray((current) => [...current, values]);
      setOpen(false);
    } else {
      toast("Duplicate SubTheme Selected", {
        type: "error",
      });
    }
  };

  const handleClickAggregate = (values) => {
    console.log(values);
    setAggregateDisAggregateArray((current) => [...current, values]);
    setOpenAggregate(false);
  };

  const removeSubTheme = (row) => {
    setSubThemesArray((current) =>
      current.filter(
        (subTheme) =>
          subTheme.indicatorSubThemeId.id !== row.indicatorSubThemeId.id ||
          subTheme.indicatorThematicAreaId.id !== row.indicatorThematicAreaId.id
      )
    );
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card mb={12}>
        <CardContent>
          {formik.isSubmitting ? (
            <Box display="flex" justifyContent="center" my={6}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={12}>
                <Grid item md={12}>
                  <Typography variant="h3" gutterBottom display="inline">
                    NEW INDICATOR
                  </Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item md={12}>
                  <TextField
                    name="name"
                    label="Indicator Name"
                    required
                    value={formik.values.name}
                    error={Boolean(formik.touched.name && formik.errors.name)}
                    fullWidth
                    helperText={formik.touched.name && formik.errors.name}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    variant="outlined"
                    my={2}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item md={4}>
                  <TextField
                    name="code"
                    label="Indicator Code"
                    required
                    value={formik.values.code}
                    error={Boolean(formik.touched.code && formik.errors.code)}
                    fullWidth
                    helperText={formik.touched.code && formik.errors.code}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    variant="outlined"
                    my={2}
                  />
                </Grid>
                <Grid item md={4}>
                  <TextField
                    name="indicatorTypeId"
                    label="Indicator Type"
                    required
                    select
                    value={formik.values.indicatorTypeId}
                    error={Boolean(
                      formik.touched.indicatorTypeId &&
                        formik.errors.indicatorTypeId
                    )}
                    fullWidth
                    helperText={
                      formik.touched.indicatorTypeId &&
                      formik.errors.indicatorTypeId
                    }
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    variant="outlined"
                    my={2}
                  >
                    <MenuItem disabled value="">
                      Select Indicator Type
                    </MenuItem>
                    {!isLoadingIndicatorType
                      ? indicatorTypeData.data.map((option) => (
                          <MenuItem
                            key={option.lookupItemId}
                            value={option.lookupItemId}
                          >
                            {option.lookupItemName}
                          </MenuItem>
                        ))
                      : []}
                  </TextField>
                </Grid>
                <Grid item md={4}>
                  <TextField
                    name="indicatorMeasure"
                    label="Indicator Measure"
                    required
                    select
                    value={formik.values.indicatorMeasure}
                    error={Boolean(
                      formik.touched.indicatorMeasure &&
                        formik.errors.indicatorMeasure
                    )}
                    fullWidth
                    helperText={
                      formik.touched.indicatorMeasure &&
                      formik.errors.indicatorMeasure
                    }
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    variant="outlined"
                    my={2}
                  >
                    <MenuItem disabled value="">
                      Select Indicator Measure
                    </MenuItem>
                    {!isLoadingIndicatorMeasure
                      ? indicatorMeasureData.data.map((option) => (
                          <MenuItem
                            key={option.lookupItemId}
                            value={option.lookupItemId}
                          >
                            {option.lookupItemName}
                          </MenuItem>
                        ))
                      : []}
                  </TextField>
                </Grid>
              </Grid>
              <TextField
                name="definition"
                label="Definition"
                value={formik.values.definition}
                error={Boolean(
                  formik.touched.definition && formik.errors.definition
                )}
                fullWidth
                helperText={
                  formik.touched.definition && formik.errors.definition
                }
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                multiline
                required
                variant="outlined"
                rows={3}
                my={2}
              />
              <Grid container spacing={2}>
                <Grid item md={3}>
                  <TextField
                    name="indicatorCalculationId"
                    label="Indicator Calculation"
                    required
                    select
                    value={formik.values.indicatorCalculationId}
                    error={Boolean(
                      formik.touched.indicatorCalculationId &&
                        formik.errors.indicatorCalculationId
                    )}
                    fullWidth
                    helperText={
                      formik.touched.indicatorCalculationId &&
                      formik.errors.indicatorCalculationId
                    }
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    variant="outlined"
                    my={2}
                  >
                    <MenuItem disabled value="">
                      Select Indicator Calculation
                    </MenuItem>
                    {!isLoadingYesNo
                      ? yesNoData.data.map((option) => (
                          <MenuItem
                            key={option.lookupItemId}
                            value={option.lookupItemId}
                          >
                            {option.lookupItemName}
                          </MenuItem>
                        ))
                      : []}
                  </TextField>
                </Grid>
                <Grid item md={3}>
                  <TextField
                    name="numeratorId"
                    label="Indicator Numerator"
                    required
                    select
                    value={formik.values.numeratorId}
                    error={Boolean(
                      formik.touched.numeratorId && formik.errors.numeratorId
                    )}
                    fullWidth
                    helperText={
                      formik.touched.numeratorId && formik.errors.numeratorId
                    }
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    variant="outlined"
                    my={2}
                  >
                    <MenuItem disabled value="">
                      Select Indicator Numerator
                    </MenuItem>
                    {!isLoading
                      ? data.data.map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {option.name}
                          </MenuItem>
                        ))
                      : []}
                  </TextField>
                </Grid>
                <Grid item md={3}>
                  <TextField
                    name="denominatorId"
                    label="Indicator Denominator"
                    required
                    select
                    value={formik.values.denominatorId}
                    error={Boolean(
                      formik.touched.denominatorId &&
                        formik.errors.denominatorId
                    )}
                    fullWidth
                    helperText={
                      formik.touched.denominatorId &&
                      formik.errors.denominatorId
                    }
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    variant="outlined"
                    my={2}
                  >
                    <MenuItem disabled value="">
                      Select Indicator Denominator
                    </MenuItem>
                    {!isLoading
                      ? data.data.map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {option.name}
                          </MenuItem>
                        ))
                      : []}
                  </TextField>
                </Grid>
                <Grid item md={3}>
                  <TextField
                    name="indicatorCumulative"
                    label="Indicator Cumulative"
                    required
                    select
                    value={formik.values.indicatorCumulative}
                    error={Boolean(
                      formik.touched.indicatorCumulative &&
                        formik.errors.indicatorCumulative
                    )}
                    fullWidth
                    helperText={
                      formik.touched.indicatorCumulative &&
                      formik.errors.indicatorCumulative
                    }
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    variant="outlined"
                    my={2}
                  >
                    <MenuItem disabled value="">
                      Select Indicator Cumulative
                    </MenuItem>
                    {!isLoadingYesNo
                      ? yesNoData.data.map((option) => (
                          <MenuItem
                            key={option.lookupItemId}
                            value={option.lookupItemId}
                          >
                            {option.lookupItemName}
                          </MenuItem>
                        ))
                      : []}
                  </TextField>
                </Grid>
                <Grid item md={12}>
                  <Card
                    variant="outlined"
                    style={{ borderStyle: "dashed", borderRadius: 1 }}
                  >
                    <Grid container spacing={12}>
                      <Grid item md={12}>
                        &nbsp;
                      </Grid>
                    </Grid>
                    <Grid container spacing={12}>
                      <Grid item md={12}>
                        <ThemeProvider theme={theme}>
                          <Button
                            variant="contained"
                            color="neutral"
                            onClick={() => setOpen(true)}
                          >
                            <AddIcon /> ADD SUB-THEME
                          </Button>
                        </ThemeProvider>
                      </Grid>
                    </Grid>
                    <Grid container spacing={12}>
                      <Grid item md={12}>
                        <Paper>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>PROGRAMME</TableCell>
                                <TableCell align="right">
                                  THEMATIC AREA
                                </TableCell>
                                <TableCell align="right">SUB THEME</TableCell>
                                <TableCell align="right">Action</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {subThemesArray.map((row) => (
                                <TableRow
                                  key={
                                    row.indicatorThematicAreaId.id +
                                    row.indicatorSubThemeId.id
                                  }
                                >
                                  <TableCell component="th" scope="row">
                                    {row.indicatorProgrammeId.name}
                                  </TableCell>
                                  <TableCell align="right">
                                    {row.indicatorThematicAreaId.code +
                                      "-" +
                                      row.indicatorThematicAreaId.name}
                                  </TableCell>
                                  <TableCell align="right">
                                    {row.indicatorSubThemeId.code +
                                      "-" +
                                      row.indicatorSubThemeId.name}
                                  </TableCell>
                                  <TableCell align="right">
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      onClick={() => removeSubTheme(row)}
                                    >
                                      <DeleteIcon />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Paper>
                      </Grid>
                    </Grid>
                    <br />
                  </Card>
                </Grid>
                <Grid item md={12}>
                  <Card
                    variant="outlined"
                    style={{ borderStyle: "dashed", borderRadius: 1 }}
                  >
                    <Grid container spacing={12}>
                      <Grid item md={12}>
                        &nbsp;
                      </Grid>
                    </Grid>
                    <Grid container spacing={12}>
                      <Grid item md={12}>
                        <ThemeProvider theme={theme}>
                          <Button
                            variant="contained"
                            color="neutral"
                            onClick={() => setOpenAggregate(true)}
                          >
                            <AddIcon /> ADD AGGREGATE DISAGGREGATES
                          </Button>
                        </ThemeProvider>
                      </Grid>
                    </Grid>
                    <Grid container spacing={12}>
                      <Grid item md={12}>
                        <Paper>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>AGGREGATE</TableCell>
                                <TableCell align="right">
                                  DISAGGREGATE
                                </TableCell>
                                <TableCell align="right">
                                  PRIMARY/SECONDARY
                                </TableCell>
                                <TableCell align="right">Action</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {aggregateDisAggregateArray.map((row) => (
                                <TableRow key={row.aggregate.id}>
                                  {/*<TableCell component="th" scope="row">*/}
                                  {/*  {row.indicatorAggregateDisaggregateId.aggregate.name}*/}
                                  {/*</TableCell>*/}
                                  {/*<TableCell align="right">*/}
                                  {/*  {row.disaggregate.name}*/}
                                  {/*</TableCell>*/}
                                  {/*<TableCell align="right">*/}
                                  {/*  {row.isPrimary ? "Primary" : "Secondary"}*/}
                                  {/*</TableCell>*/}
                                  <TableCell align="right">
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      onClick={() => removeSubTheme(row)}
                                    >
                                      <DeleteIcon />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Paper>
                      </Grid>
                    </Grid>
                    <br />
                  </Card>
                </Grid>
              </Grid>
              <Button type="submit" variant="contained" color="primary" mt={3}>
                Save changes
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      <Dialog
        fullWidth={true}
        maxWidth="md"
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">
          PROGRAMME/THEMATIC-AREA/SUB-THEME
        </DialogTitle>
        <DialogContent>
          <DialogContentText>ADD SUB-THEME</DialogContentText>
          <IndicatorProgrammesForm handleClick={handleClick} />
        </DialogContent>
      </Dialog>
      <Dialog
        fullWidth={true}
        maxWidth="md"
        open={openAggregate}
        onClose={() => setOpenAggregate(false)}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">AGGREGATE/DISAGGREGATE</DialogTitle>
        <DialogContent>
          <DialogContentText>ADD AGGREGATE/DISAGGREGATE</DialogContentText>
          <AggregateDisAggregateForm
            handleClickAggregate={handleClickAggregate}
          />
        </DialogContent>
      </Dialog>
    </form>
  );
};

const NewIndicator = () => {
  return (
    <React.Fragment>
      <Helmet title="New Indicator" />
      <Typography variant="h3" gutterBottom display="inline">
        New Indicator
      </Typography>

      <Breadcrumbs aria-label="Breadcrumb" mt={2}>
        <Link component={NavLink} to="/indicator/indicators">
          Indicators
        </Link>
        <Typography>New Indicator</Typography>
      </Breadcrumbs>

      <Divider my={6} />
      <NewIndicatorForm />
    </React.Fragment>
  );
};
export default NewIndicator;