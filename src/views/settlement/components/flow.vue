<template>
  <div>
    <div class="flow">
        <div class="flow-item flow-begin">
            <div class="beginleft mr-32">
            <el-avatar :size="50" :src="createAvg?createAvg:defaultAvg"></el-avatar>
            </div>
            <div class="right">
                <div>{{createName}}</div>
                <div>{{createTime}}</div>
                <div>发起流程</div>
            </div>
        </div>
        <div class="flow-item" v-for="(item,index) in list" :key="index">
            <div class="left mr-32">
                <div class="linkline"></div>
                <img src="../../../assets/avg.svg" alt="">
                <div class="flowname">{{item.nodeName}}</div>
            </div>
            <div class="right" v-show="!!item.approveResult">
                <div>{{item.approver}}</div>
                <div>{{item.approveTime}}</div>
                <div class="approveStates">{{item.approveResult}}</div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
export default {
    props:{
        createName:{
            type:String,
            default:""
        },
        createTime:{
            type:String,
            default:""
        },
        createAvg:{
            type:String,
            default:"https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
        },
        list:{
            type:Array,
            default:()=>{
                return []
            }
        }
    },
    data(){
        return{
            defaultAvg:"https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
        }
    }
}
</script>

<style lang="scss" scoped>
.flow-item{
    width: 300px;
    padding: 17px 28px;
    display: flex;
    .beginleft{
        display: flex;
        justify-content: center;
        align-items: center;
        width: 94px;
        min-height: 60px;
    }
    .left{
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
        width: 94px;
        min-height: 60px;
        border: 1px solid #d9dddf;
        border-radius: 6px;
        .flowname{
            font-size: 13px;
        }
    }
    .right{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 130px;
        min-height: 60px;
        font-size: 10px;
        border: 1px dashed #d9dddf;
        border-radius: 6px;
    }
    .linkline{
        position: absolute;
        top: -35px;
        left: 50%;
        transform: translateX(-50%);
        height: 34px;
        border: 1px dashed #d9dddf;
    }
    .approveStates{
        overflow: hidden;				//溢出内容隐藏
	    text-overflow: ellipsis;		//文本溢出部分用省略号表示
	    display: -webkit-box;			//特别显示模式
	    -webkit-line-clamp: 2;			//行数
	    line-clamp: 2;					
	    -webkit-box-orient: vertical;	//盒子中内容竖直排列
    }
}
.mr-32{
    margin-right: 32px;
}

</style>