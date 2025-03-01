import React, { useState } from "react";
import {
  Button as MuiButton,
  Card as MuiCard,
  CardContent as MuiCardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  MenuItem,
  Paper as MuiPaper,
  TextField as MuiTextField,
  Typography,
} from "@mui/material";
import { spacing } from "@mui/system";
import styled from "@emotion/styled";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllThematicAreas,
  getThematicArea,
} from "../../../api/thematic-area";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { getSubThemesByThematicAreaId } from "../../../api/thematic-area-sub-theme";
import { Check, Trash as TrashIcon } from "react-feather";
import { Guid } from "../../../utils/guid";
import {
  deleteProjectThematicFocus,
  getProjectThematicFocusByProcessLevelItemId,
  saveProjectThematicFocus,
} from "../../../api/thematic-focus";
import { DataGrid } from "@mui/x-data-grid";
import { getSubTheme } from "../../../api/sub-theme";

const Card = styled(MuiCard)(spacing);
const CardContent = styled(MuiCardContent)(spacing);
const TextField = styled(MuiTextField)(spacing);
const Button = styled(MuiButton)(spacing);
const Paper = styled(MuiPaper)(spacing);

const initialValues = {
  thematicArea: "",
};

const ThematicFocus = ({ id, processLevelTypeId }) => {
  const queryClient = useQueryClient();
  const [thematicAreaId, setThematicAreaId] = useState();
  const [open, setOpen] = React.useState(false);
  const [thematicFocusId, setThematicFocusId] = React.useState();
  const { data, isLoading } = useQuery(
    ["getAllThematicAreas"],
    getAllThematicAreas,
    {
      refetchOnWindowFocus: false,
    }
  );
  const { data: subThemesData, isLoading: isLoadingSubThemes } = useQuery(
    ["getSubThemesByThematicAreaId", thematicAreaId],
    getSubThemesByThematicAreaId,
    { enabled: !!thematicAreaId }
  );
  const {
    data: projectThematicFocusData,
    isLoading: isLoadingProjectThematicFocus,
  } = useQuery(
    ["getProjectThematicFocusByProcessLevelItemId", id],
    getProjectThematicFocusByProcessLevelItemId,
    { enabled: !!id }
  );
  const mutation = useMutation({ mutationFn: saveProjectThematicFocus });

  const formik = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      thematicArea: Yup.object().required("Required"),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        for (const subThemesDatum of subThemesData.data) {
          if (
            values.hasOwnProperty(subThemesDatum.subThemeId) &&
            values[subThemesDatum.subThemeId].length > 0
          ) {
            const projectThematicFocus = {
              processLevelItemId: id,
              processLevelTypeId: processLevelTypeId,
              createDate: new Date(),
              subThemeId: subThemesDatum.subThemeId,
              thematicAreaId: subThemesDatum.thematicAreaId,
              id: new Guid().toString(),
            };
            await mutation.mutateAsync(projectThematicFocus);
          }
        }
        await queryClient.invalidateQueries([
          "getProjectThematicFocusByProcessLevelItemId",
        ]);
        toast("Successfully added Project Thematic Focus", {
          type: "success",
        });
      } catch (error) {
        toast(error.response.data, {
          type: "error",
        });
      }
    },
  });

  function HandleThematicAreaChange(e) {
    const thematicAreaId = e.target.value.id;
    setThematicAreaId(thematicAreaId);
  }

  function GetSubTheme(params) {
    const subThemeId = params.row.subThemeId;
    const thematicAreaId = params.row.thematicAreaId;
    const result = useQuery(["getSubTheme", subThemeId], getSubTheme);
    const resultThematic = useQuery(
      ["getThematicArea", thematicAreaId],
      getThematicArea
    );
    if (result && result.data && resultThematic && resultThematic.data) {
      return `${result.data.data.name}(${resultThematic.data.data.name})`;
    }
  }

  function handleClickOpen(thematicFocusId) {
    setOpen(true);
    setThematicFocusId(thematicFocusId);
  }

  function handleClose() {
    setOpen(false);
  }

  const { refetch } = useQuery(
    ["deleteProjectThematicFocus", thematicFocusId],
    deleteProjectThematicFocus,
    { enabled: false }
  );

  const handleDeleteProjectThematicFocus = async () => {
    await refetch();
    setOpen(false);
    await queryClient.invalidateQueries([
      "getProjectThematicFocusByProcessLevelItemId",
    ]);
  };

  return (
    <Card mb={12}>
      <CardContent>
        <Grid container spacing={12}>
          <Grid item md={12}>
            <Typography variant="h3" gutterBottom display="inline">
              Thematic Focus
            </Typography>
          </Grid>
          <Grid item md={12}>
            <CardContent pb={1}>
              <form onSubmit={formik.handleSubmit}>
                <Grid container item spacing={2}>
                  <Grid item md={4}>
                    <TextField
                      name="thematicArea"
                      label="Thematic Area"
                      required
                      select
                      value={formik.values.thematicArea}
                      error={Boolean(
                        formik.touched.thematicArea &&
                          formik.errors.thematicArea
                      )}
                      fullWidth
                      helperText={
                        formik.touched.thematicArea &&
                        formik.errors.thematicArea
                      }
                      onBlur={formik.handleBlur}
                      onChange={(e) => {
                        formik.handleChange(e);
                        HandleThematicAreaChange(e);
                      }}
                      variant="outlined"
                      my={2}
                    >
                      <MenuItem disabled value="">
                        Select Thematic Area
                      </MenuItem>
                      {!isLoading
                        ? data.data.map((option) => (
                            <MenuItem key={option.id} value={option}>
                              {option.name}
                            </MenuItem>
                          ))
                        : []}
                    </TextField>
                  </Grid>
                  <Grid item md={4}>
                    &nbsp;
                  </Grid>
                  <Grid item md={4}>
                    &nbsp;
                  </Grid>
                  <Grid item md={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <h3>
                          THEMATIC AREA:&nbsp;
                          <strong>
                            {formik.values.thematicArea
                              ? formik.values.thematicArea.name
                              : ""}
                          </strong>
                        </h3>
                        <Grid item md={12}>
                          {!isLoadingSubThemes &&
                            subThemesData.data.map((value, index) => {
                              return (
                                <Grid container item spacing={2} key={index}>
                                  <Grid item md={2}>
                                    <FormGroup>
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            onChange={formik.handleChange}
                                            name={value.subTheme.id}
                                          />
                                        }
                                        label={value.subTheme.name}
                                      />
                                    </FormGroup>
                                  </Grid>
                                </Grid>
                              );
                            })}
                        </Grid>
                        <Grid item md={12}>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            mt={3}
                          >
                            <Check /> Save Sub-Theme
                          </Button>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                <br />
                <br />
                <br />
                <Grid container item spacing={2}>
                  <Grid item md={12}>
                    <Paper style={{ height: 250, width: "100%" }}>
                      <DataGrid
                        rowsPerPageOptions={[5, 10, 25]}
                        rows={
                          isLoadingProjectThematicFocus
                            ? []
                            : projectThematicFocusData
                            ? projectThematicFocusData.data
                            : []
                        }
                        columns={[
                          {
                            field: "subThemeId",
                            colId: "subThemeId&thematicAreaId",
                            headerName: "SUB-THEME(THEMATICAREA)",
                            editable: false,
                            flex: 1,
                            valueGetter: GetSubTheme,
                          },
                          {
                            field: "action",
                            headerName: "Action",
                            sortable: false,
                            flex: 1,
                            renderCell: (params) => (
                              <>
                                <Button
                                  startIcon={<TrashIcon />}
                                  size="small"
                                  onClick={(e) => handleClickOpen(params.id)}
                                ></Button>
                              </>
                            ),
                          },
                        ]}
                        loading={isLoadingProjectThematicFocus}
                        getRowHeight={() => "auto"}
                      />
                    </Paper>
                    <Dialog
                      open={open}
                      onClose={handleClose}
                      aria-labelledby="alert-dialog-title"
                      aria-describedby="alert-dialog-description"
                    >
                      <DialogTitle id="alert-dialog-title">
                        Delete Project Thematic Focus
                      </DialogTitle>
                      <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                          Are you sure you want to delete Project Thematic
                          Focus?
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={handleDeleteProjectThematicFocus}
                          color="primary"
                        >
                          Yes
                        </Button>
                        <Button onClick={handleClose} color="error" autoFocus>
                          No
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
export default ThematicFocus;
