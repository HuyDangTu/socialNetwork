import React, { Component } from 'react';
import { connect } from 'react-redux';
import Layout from '../Layout/index';
import { withRouter } from 'react-router-dom';
import { getReportDetail, updateReport, deletePost, clearDetail, deleteComment, restrictUser, deleteRestrictedFunction } from '../../../actions/report_actions';
import CircularProgress from '@material-ui/core/CircularProgress';
import './ReportDetail.scss';
import Slide from '@material-ui/core/Slide';
import Dialog from '@material-ui/core/Dialog';
import { Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert'
import moment from 'moment';

import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import { Ban , User , Photo, CircleCheck, Receipt } from 'tabler-icons-react';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

class ReportDetail extends Component {

    state={
        id: "",
        limit: 5,
        DialogShowing: false,
        dialogType: "",

        userId: "",

        setSnack: false,
        severity: "",
        message: "",

        restrictedFunctions: [],

        err: false,
        func: "",
        time: "",
    }

    componentDidMount(){
        const id = this.props.match.params.id;
        this.setState({
            id: id
        })
        this.props.dispatch(getReportDetail(id)).then(response=>{
            console.log(response)
            if(response.payload.reportDetail){
                let detail = response.payload.reportDetail;
                switch(detail.reportType){
                    case "user":
                        this.setState({userId: detail.userId[0]._id});
                        break;
                    case "comment":
                        this.setState({userId: detail.post[0].postedBy[0]._id});
                        break;
                    case "post":
                        this.setState({userId: detail.post[0].postedBy[0]._id});
                        break;
                }
            }
        });    
    }

    componentWillUnmount() {
        this.props.dispatch(clearDetail());
    }

    renderContent = (detail) => {
        switch(detail.reportType){
            case "post": {
                return (
                    <div className="content_wrapper">
                        <p><b>N???i dung:</b></p>
                        <div className="user_info">
                            <img src={detail.post[0].postedBy[0].avt}/>
                            <div className="name">
                                {detail.post[0].postedBy[0].userName}
                            </div>
                        </div>
                        <p>{detail.post[0].description}</p>
                        <div className="images">
                            <img src={detail.post[0].images[0].url} />
                        </div>
                        <p className="likes">
                            <img src={require('../../../asset/newfeed_page/active_like_icon2x.png')} />
                            {detail.post[0].likes.length} l?????t th??ch
                        </p>
                        <div className="comment_list">
                        {
                            this.showComments(detail.post[0].comments)
                        }
                        </div>
                    </div>
                )
            }
            case "comment":{
                const comment = detail.comment[0]; 
                const post = detail.post[0]; 
                return (
                <div className="content_wrapper">
                    <p><b>N???i dung:</b></p>
                    <div className="comment_list">
                        <div className="comment">
                            <div className="user_avt">
                                <img src={comment.postedBy[0].avt} />
                            </div>
                            <div className="content">
                                <b>{comment.postedBy[0].userName}</b> {comment.content}
                                <p>
                                    {comment.likes.length} l?????t th??ch
                                </p>
                            </div>
                        </div>
                    </div>
                    <p>trong b??i vi???t: </p>
                    <div className="user_info">
                        <img src={post.postedBy[0].avt} />
                        <div className="name">
                            {post.postedBy[0].userName}
                        </div>
                    </div>
                    <p>{post.description}</p>
                    <div className="images">
                        <img src={post.images[0].url} />
                    </div>
                    <p className="likes">
                        <img src={require('../../../asset/newfeed_page/active_like_icon2x.png')} />
                        {post.likes.length} l?????t th??ch
                    </p>
                </div>)
            }
            case "user":{
                const user = detail.userId[0];
                const posts = detail.posts; 
                return (
                <div className="content_wrapper">
                    <p><b>N???i dung:</b></p> 
                    <div className="user-info">
                        <div className="account-info">
                            <img src={user.avt}/>
                            <div>
                                <p><b>{user.userName}</b></p>
                                <p><i>{user.bio}</i></p>
                            </div>
                        </div>
                        <p className="segment-title"><User
                                size={22}
                                strokeWidth={3}
                                color={'#7166F9'}
                            /><b>Th??ng tin c?? nh??n</b></p>
                        <p><b>T??n:</b> {user.lastname} {user.name}</p>
                        <p><b>Ng??y sinh:</b> {user.dob}</p>
                        <p><b>Email:</b> {user.email}</p>
                        <p><b>??ang theo d??i:</b> {user.followings.length}</p>
                        <p><b>Ng?????i theo d??i:</b> {user.followers.length}</p>
                    </div>
                    <div className="user-resticted-functions">
                        <p className="segment-title"><Ban
                                size={22}
                                strokeWidth={3}
                                color={'#7166F9'}
                            />
                        <b>Ch???c n??ng b??? h???n ch???</b></p>
                        <ul className="resticted-functions-list">
                            {
                                user.restrictedFunctions.map(item=>{
                                    return this.isRestricted(item)?
                                    <li className="user-resticted-item">
                                        <div>
                                            <b>{item.function}</b>
                                            {moment(item.amountOfTime).format("L")}
                                        </div>
                                        <Button onClick={()=>{
                                            this.setState({
                                                DialogShowing: true,
                                                dialogType: "deleteRestrictedFunctionConfirm",
                                                funcId: item._id,
                                            })
                                        }} variant="outlined" color="primary">
                                            X??a
                                        </Button>
                                    </li>
                                    : ""
                                })
                            }
                        </ul>
                    </div>
                    <div className="user-posts">
                       <p className="segment-title"><Photo
                                size={22}
                                strokeWidth={3}
                                color={'#7166F9'}
                            /><b>B??i vi???t g???n ????y</b></p>
                        <div className="row no-gutters">
                            {
                                posts.map(item=>{
                                    return <div className="col-xl-3 no-gutters">
                                        <img className="post" src={item.images[0].url}/>
                                    </div>
                                })
                            }
                        </div>
                    </div>
                </div>)
            }
        }
    }

    showComments = (comments) => {
        let commentsToShow = [];
        if (comments[0].content) {
            for (let i = 0; i < this.state.limit; i++) {
                if (comments[i] && comments[i].content) {
                    commentsToShow.push(comments[i]);
                }
                else {
                    break;
                }
            }
        }
        return commentsToShow.map((item, i) =>
            item ?
                <div className="comment">
                    <div className="user_avt">
                        <img src={item.postedBy[0].avt} />
                    </div>
                    <div className="content">
                        <b>{item.postedBy[0].userName}</b> {item.content}
                        <p>
                            {item.likes.length} l?????t th??ch
                        </p>
                    </div>
                </div>
            : null
        )
    }

    renderPolicies(list) {
        return list.map((item) => {
            return <div className="policy_content">{item.content}</div>
        })
    }

    AddRestrictedFunction = (func,time) =>{
        if(func == "" || time == ""){
            this.setState({err: true});
        }else{
            if(this.state.restrictedFunctions.some(item => item.func == func)){
                console.log("shdghj");
                let updatedRestrictedFunctions = [...this.state.restrictedFunctions]
                updatedRestrictedFunctions.map(item => {
                    if(item.func == func){
                        item.time = time;
                    }
                })
                this.setState({
                    restrictedFunctions: updatedRestrictedFunctions,
                    err: false,
                })
            }else{
                console.log("t??yeyudghj");
                let updatedRestrictedFunctions = [...this.state.restrictedFunctions]
                updatedRestrictedFunctions.push({func,time})
                this.setState({
                    restrictedFunctions: updatedRestrictedFunctions,
                    err: false,
                })
            }
        }
    }

    deleteContent = () => {
        if (this.props.reports.reportDetail.reportType == "post"){
            this.props.dispatch(deletePost(this.props.reports.reportDetail.post[0]._id, this.state.id))
            .then((response) => {
                console.log(response)
                if (response.payload.report) {
                    this.setState({ DialogShowing: false, setSnack: true, severity: "success", message: "Th??nh c??ng" })
                } else {
                    this.setState({ DialogShowing: false, setSnack: true, severity: "error", message: "???? x??y ra l???i" })
                }
            })
        }else{
            this.props.dispatch(deleteComment(this.props.reports.reportDetail.comment[0]._id, this.state.id, this.props.reports.reportDetail.post[0]._id))
            .then((response) => {
                console.log(response)
                if (response.payload.report) {
                    this.setState({ DialogShowing: false, setSnack: true, severity: "success", message: "Th??nh c??ng" })
                } else {
                    this.setState({ DialogShowing: false, setSnack: true, severity: "error", message: "???? x??y ra l???i" })
                }
            })
        }
    }

    deleteRestrictedFunction = () =>{
        this.props.dispatch(deleteRestrictedFunction(this.state.funcId, this.props.reports.reportDetail.userId[0]._id))
            .then((response) => {
                console.log(response)
                if (response.payload.success) {
                    this.setState({ DialogShowing: false, setSnack: true, severity: "success", message: "Th??nh c??ng" })
                } else {
                    this.setState({ DialogShowing: false, setSnack: true, severity: "error", message: "???? x??y ra l???i" })
                }
            })
    }

    handleClick = () =>{}

    handleDelete = (func) =>{
        let updatedRestrictedFunctions = [...this.state.restrictedFunctions]
        updatedRestrictedFunctions = updatedRestrictedFunctions.filter(item => 
            item.func != func
        )
        this.setState({
            restrictedFunctions: updatedRestrictedFunctions
        },()=>{console.log(this.state.restrictedFunctions)})
    }
    
    selectFunc = (event) => {
        // console.log(event);
        this.setState({func: event.target.value})
    }
    selectTime = (event) => {
        this.setState({time: event.target.value})
        // console.log(event);
    }

    restrictUserFunction = () =>{
        if(this.state.restrictedFunctions.length == 0){
            this.setState({err: true})
        }else{
            console.log(this.state.userId)
            this.props.dispatch(restrictUser(this.state.restrictedFunctions,this.state.userId,this.state.id)).then(response => {
                console.log(response)
                if(response.payload.success){
                    this.setState({
                        setSnack: true,
                        severity: "success",
                        message: "Tha??nh c??ng",
                        DialogShowing: false,
                    });
                }
            })
        }
    }

    confirmDialog(type) {
        let template = "";
        switch (type) {
            case "invalidReport":
                template = (
                    <div className="deleteConfirm">
                        <h5>X??c nh???n b??o c??o l?? kh??ng h???p l???</h5>
                        <div className="btn_wrapper">
                            <p className="cancel_btn" onClick={() => this.setState({ DialogShowing: false })}>H???y</p>
                            <p className="confirm_btn" onClick={() => this.props.dispatch(updateReport(this.state.id))
                                .then((response) => {
                                    console.log(response)
                                    if(response.payload.report){
                                        this.setState({ DialogShowing: false, setSnack: true, severity:"success", message: "Th??nh c??ng" })
                                    }else{
                                        this.setState({ DialogShowing: false, setSnack: true, severity: "error", message: "???? x??y ra l???i" })
                                    }
                                })}>X??c nh???n</p>
                        </div>
                    </div>)
                break;
            case "deleteConfirm":
                template = (
                    <div className="deleteConfirm">
                        <h5> Ba??n co?? ch????c ch????n xo??a n????i dung na??y</h5>
                        <div className="btn_wrapper">
                            <p className="confirm_btn" onClick={() => {this.deleteContent()}} >Xo??a n????i dung</p>
                            <p className="cancel_btn" onClick={() => this.setState({ DialogShowing: false })}>Hu??y</p>
                        </div>
                    </div>)
                break;
             case "deleteRestrictedFunctionConfirm":
                template = (
                    <div className="deleteConfirm">
                        <h5> Ba??n co?? ch????c ch????n g??? h???n ch??? cho t??i kho???n n??y?</h5>
                        <div className="btn_wrapper">
                            <p className="confirm_btn" onClick={() => {this.deleteRestrictedFunction()}} >Xo??a n????i dung</p>
                            <p className="cancel_btn" onClick={() => this.setState({ DialogShowing: false })}>Hu??y</p>
                        </div>
                    </div>)
                break;
            case "restrictFunctions":
                template = (
                    <div className="deleteConfirm">
                        <h5> Ha??n ch???? ch????c n??ng cu??a ng??????i du??ng vi pha??m</h5>
                        <div className="restricted-functions">
                        {
                            this.state.restrictedFunctions? 
                                this.state.restrictedFunctions.map(item => {
                                    return  <Chip
                                        label={` ${item.func} | ${item.time} nga??y `}
                                        onClick={() => this.handleDelete(item.func)}
                                        onDelete={() => this.handleDelete(item.func)}
                                        variant="outlined"
                                        />
                                })
                            :""
                        }
                        <p>{this.state.err?"Vui lo??ng cho??n ch????c n??ng va?? th????i gian":""}</p>
                        </div>
                        <div className="add-restricted-functions">
                        <FormControl variant="outlined" className="select">
                            <InputLabel id="demo-simple-select-outlined-label">Ch????c n??ng</InputLabel>
                            <Select
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            onChange={(event) => {this.selectFunc(event)}}
                            label="Ch????c n??ng"
                            >
                            <MenuItem value="Like">Thi??ch</MenuItem>
                            <MenuItem value="Post">????ng ba??i</MenuItem>
                            <MenuItem value="Comment">Bi??nh lu????n</MenuItem>
                            <MenuItem value="Save">L??u</MenuItem>
                            <MenuItem value="Follow">Theo do??i</MenuItem>
                            </Select>
                        </FormControl>
                             <FormControl variant="outlined" className="select">
                                <InputLabel id="demo-simple-select-outlined-label">Th????i gian</InputLabel>
                                <Select
                                labelId="demo-simple-select-outlined-label"
                                id="demo-simple-select-outlined"
                                onChange={(event) => {this.selectTime(event)}}
                                label="Th????i gian"
                                >
                                <MenuItem value={7}>7</MenuItem>
                                <MenuItem value={15}>15</MenuItem>
                                <MenuItem value={30}>30</MenuItem>
                                </Select>
                            </FormControl>
                            <Button onClick={()=>{this.AddRestrictedFunction(this.state.func, this.state.time)}} variant="outlined" color="primary">
                                Th??m
                            </Button>
                            {/* <button onClick={this.AddRestrictedFunction}>Add</button> */}
                        </div>
                        <div className="btn_wrapper">
                            <p className="cancel_btn" onClick={() => this.setState({ DialogShowing: false })}>Hu??y</p>
                            <p className="confirm_btn" onClick={() => {this.restrictUserFunction()}} >Xong</p>
                        </div>
                    </div>)
                break;
            default:
                template = (<div></div>)
                break;
        }

        return <Dialog
            open={this.state.DialogShowing}
            TransitionComponent={Transition}
            keepMounted
            onClose={() => { this.setState({ DialogShowing: false }) }}>
            {template}
        </Dialog>
    }

    isRestricted(restrictedFunction){
        var today = moment().startOf('day').valueOf();
        if(restrictedFunction.amountOfTime>today){
            return true
        }else{
            return false
        }
    }

    render() {
        const detail = this.props.reports.reportDetail;
        return (
            <Layout page="report">
                <div className="report_detail" >
                    <h2 className="page_title">Chi ti???t b??o c??o</h2>
                    {
                        this.props.reports.reportDetail ?
                            <div className="row no-gutters">
                            <div className="col-xl-6 no-gutters">
                                {
                                    this.renderContent(this.props.reports.reportDetail)
                                }
                            </div>
                                <div className="col-xl-6 no-gutters">
                                <div className="report_info ">
                                    <p><b>Ng?????i b??o c??o:</b></p>
                                        <div className="user_info">
                                            <img src={detail.sentBy[0].avt} />
                                            <div className="name">
                                                {detail.sentBy[0].userName}
                                            </div>
                                        </div>
                                    <p>Ng??y: <b>{moment(detail.createdAt).fromNow()}</b></p>
                                    <p>T??nh tr???ng: <b>{detail.status ?"???? x??? l??":"Ch??a x??? l??"}</b></p>
                                    {/* <p>Ch??nh s??ch vi ph???m</p>
                                    <div>
                                        {
                                            this.renderPolicies(detail.reportAbout)
                                        }
                                    </div> */}
                                    {
                                        !detail.status ? 
                                        <div className="button_wrapper">
                                                <p><b>X??? l??</b></p>
                                                <button className="btn_invalid" onClick={() => {
                                                    this.setState({
                                                        DialogShowing: true,
                                                        dialogType: "invalidReport",
                                                    })
                                                }}>N????i dung kh??ng vi pha??m</button>
                                                {detail.reportType == "user" ? 
                                                 <button className="btn_restrict" onClick={() => {
                                                    this.setState({
                                                        DialogShowing: true,
                                                        dialogType: "restrictFunctions",
                                                    })
                                                }}>Ha??n ch???? ta??i khoa??n</button>: 
                                                <button className="btn_delete" onClick={() => {
                                                    this.setState({
                                                        DialogShowing: true,
                                                        dialogType: "deleteConfirm",
                                                    })
                                                }}>Xo??a n????i dung</button>
                                                }
                                        </div>
                                        : "" 
                                    }
                                    {/* <p>???? x??? l?? ng??y: <b>{moment(detail.updatedAt).fromNow()} </b></p> */}
                                </div>
                            </div>
                        </div>
                            : <CircularProgress />
                    }
                </div>
                {
                    this.confirmDialog(this.state.dialogType)
                }
                {
                    <Snackbar
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center'
                        }}
                        open={this.state.setSnack}
                        onClose={() => this.setState({ setSnack: false })}
                        autoHideDuration={1000}
                    >
                        <MuiAlert elevation={6} variant="filled" severity={this.state.severity} >{this.state.message}</MuiAlert>
                    </Snackbar>
                }
            </Layout>
        );
    }
}

function mapStateToProps(state) {
    return {
        reports: state.reports
    };
}

export default connect(mapStateToProps)(withRouter(ReportDetail));