<template>
  <div class="calendar-card">
    <div class="calendar-bar">
      <!-- <button class="button button-year-minus" @click="minusYear(true)">
          &lt;
        </button> -->
      <div class="title-left-ri" style="position:absolute;left: 2px;">
        <span class="title-left"></span>
        <div class="richeng" style="font-size: 18px; display: inline-block;">日程</div>
      </div>
      <!-- <button class="button button-month-minus" @click="minusMonth">
        &lt;
      </button> -->
      <div class="calendar-date">
        <i class="el-icon-arrow-left"  style="font-weight: 900;"  @click="minusMonth"></i>
        {{ date.year }}年{{ date.month + 1 }}月
        <i class="el-icon-arrow-right" style="font-weight: 900;"  @click="plusMonth(true)"></i>
          <!-- <img class="calendar-date-img" src="../assets/triangle.png" @click="plusMonth(true)" alt=""> -->
      </div>
      <!-- <button class="button button-month-plus" @click="plusMonth">&gt;</button> -->
      <!-- <button class="button button-year-plus" @click="plusYear(true)">
          &gt;
        </button> -->
    </div>
    <div class="calendar-content">
      <ul class="ul-week">
        <li class="li-week" v-for="(item, index) in week" :key="index">{{ item }}</li>
      </ul>
      <ul class="ul-day">
        <li class="li-day" v-for="(item, index) in days" :key="index" :isThisMonth="item.isThisMonth"
          @click="handleClick(item,index)">
          {{ item.date }}
          <span class="red-dot" v-if="arr.indexOf(item.date) != -1 && month == item.month + 1"></span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "SimpleCalendar",
  data() {
    return {
      date: {
        year: "",
        month: "",
        date: "",
      },
      current: {
        year: "",
        month: "",
        date: "",
      },
      week: ["日", "一", "二", "三", "四", "五", "六"],
      days: [],
      arr: [],
      month: ""
    };
  },
  methods: {
    searchMatterByUserId() {
      this.arr = []
      this.$api.searchMatterByUserId().then(res => {
        if (res.code == 200) {
          console.log("xxxxxxxxxxxxxxx")
          console.log(res.data)
          res.data.forEach(item => {
            if (item.number > 0) {
              this.arr.push(item.date)
            }
          });
          console.log(this.days)
          console.log(this.month)
          console.log("xxxxxxxxxxxxxxx")
        } else {
          this.$message.warning(res.msg)
        }
      })
    },
    handleClick(item,idx) {
      // date.year
      console.log(item)
      console.log(this.days)
      this.days.forEach((item,index)=>{
        if(item.isThisMonth ==3){
          item.isThisMonth =this.days[index-1].isThisMonth
        }
      })
      this.days[idx].isThisMonth =3
      let yue = (Number(item.month)+1);
      yue = yue.toString()
      if(yue.length==1){
        console.log(yue.length)
        yue = "0"+yue.toString()
      }
      let ri = item.date.toString()
      if(ri.length==1){
        ri = "0" + ri;
      }
      // console.log(yue)
      // .isThisMonth
      // console.log(item.year + "-" + item.month + "-" + item.date);
      // alert(item.year + "-" + item.month +1+ "-" + item.date);
      this.$emit("handleClick",this.date.year+ "-" +yue + "-" + ri);
    },
    plusMonth() {
      if (this.date.month == 11) {
        this.date.month = 0;
        this.plusYear(false);
      } else {
        this.date.month++;
      }
      this.createCalendar(this.date.year, this.date.month);
    },
    minusMonth() {
      if (this.date.month == 0) {
        this.date.month = 11;
        this.minusYear(false);
      } else {
        this.date.month--;
      }
      this.createCalendar(this.date.year, this.date.month);
    },
    plusYear(create) {
      if (this.date.year == 2049) {
        this.date.year = 1970;
      } else {
        this.date.year++;
      }
      if (create) {
        this.createCalendar(this.date.year, this.date.month);
      }
    },
    minusYear(create) {
      if (this.date.year == 1970) {
        this.date.year = 2049;
      } else {
        this.date.year--;
      }
      if (create) {
        this.createCalendar(this.date.year, this.date.month);
      }
    },
    createCalendar(year, month) {
      let d = new Date();
      d.setFullYear(year);
      d.setMonth(month);
      d.setDate(1);
      let dayOfFirstDay = d.getDay();
      this.days = [];
      for (let i = 0; i < 42; i++) {
        d.setDate(1);
        d.setMonth(month);
        d.setDate(i - dayOfFirstDay + 1);
        let isThisMonth = 1;
        if (d.getMonth() == month) {
          isThisMonth = 2;
        } else {
          isThisMonth = 1;
        }
        if (
          this.current.date == d.getDate() &&
          this.current.month == d.getMonth() &&
          this.current.year == d.getFullYear()
        ) {
          isThisMonth = 3;
          let date = {
            year: year,
            month: month,
            date: d.getDate(),
            isThisMonth: isThisMonth,
          };
          this.days.push(date);
        } else {
          let date = {
            year: d.getFullYear(),
            month: d.getMonth(),
            date: d.getDate(),
            isThisMonth: isThisMonth,
          };
          this.days.push(date);
        }
      }
      this.month = d.getMonth();
      console.log(this.days)
    },
  },
  created() {
    let d = new Date();
    this.date.year = d.getFullYear();
    this.date.month = d.getMonth();
    this.date.date = d.getDate();
    this.current.year = d.getFullYear();
    this.current.month = d.getMonth();
    this.current.date = d.getDate();
    this.createCalendar(this.current.year, this.current.month);
    this.searchMatterByUserId();
  },
};
</script>

<style scoped>
body {
  background-color: #ddd;
}

.richeng{
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0px;
  color: rgba(51, 51, 51, 1);
  text-align: left;
  vertical-align: top;
}
.title-left-ri{
   display: flex;
   align-items: center;
}
.calendar-content{
    margin-top: 5px;
    display: flex;
    flex-direction: column;
}
.calendar-card {
  /* position: absolute; */
  /* width: 290px; */
  height: 235px;
  padding: 0 5px 0px 5px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background-color: #fff;
}

/* .calendar-card:hover {
    box-shadow: 0px 0px 5px 5px #cfcfcf;
  } */
.calendar-bar {
  height: 40px;
  color: #727272;
  line-height: 40px;
  text-align: right;
  border-bottom: 1px solid #f2f2f2;
  margin-bottom: 2px;
  position: relative;
  /* background-color: #ebeef5; */
}

.calendar-date {
   display: inline-block;
  /* width: 100px; */
   padding-right: 8px;
   font-size: 16px;
   font-weight: 500;
   letter-spacing: 0px;
   color: rgba(51, 51, 51, 1);
   text-align: left;
}
.calendar-date-img{
  width: 12px;
  height: 6px;
  
}

.button {
  width: 20px;
  height: 20px;
  background-color: #fff;
  color: #aaa;
  border: 0;
  border-radius: 5px;
}

.button:hover {
  background-color: #eee;
  cursor: pointer;
}

.ul-week {
  /* display: grid; */
  width: 300px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* width: 245px; */
  /* grid-template-rows: 20px;
  grid-template-columns: repeat(7, 43px); */
  /**/
  list-style: none;
  text-align: center;
  font-size: 13px;
  color: #3f8dfd;
  /* margin: 5px 20px 5px 20px; */
  padding-inline-start: 0px;
  padding-inline-end: 0px;
  /* opacity:0.4; */
  border-radius:6px;
  background: rgba(166, 165, 233, 0.3);
  
}

.li-week {
  /* display: inline-block; */
  display: flex;
  /* background: rgba(166, 165, 233, 0.3); */
  justify-content: space-between;
  padding: 0 10px;
}

.ul-day {
  display: grid;
  width: 245px;
  grid-template-rows: repeat(6, 25px);
  grid-template-columns: repeat(7, 45px);
  list-style: none;
  text-align: center;
  /* margin: 5px 20px 5px 20px; */
  padding-inline-start: 0px;
  padding-inline-end: 0px;
}

.li-day {
  position: relative;
  display: inline-block;
  font-size: 10px;
  line-height: 25px;
  height: 25px;
  width: 25px;
  text-align: center;
  border-radius: 50%;
  margin: 1px;
  color: rgb(91, 91, 91);
}

.red-dot {
  position: absolute;
  top: 0;
  right: 5px;
  display: inline-block;
  width: 5px;
  height: 5px;
  background-color: red;
  border-radius: 8px;
}

.li-day:hover {
  background-color: #3f8dfd;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
}

.li-day[isThisMonth="1"] {
  color: rgb(190, 190, 190);
  font-size: 10px;
}

.li-day[isThisMonth="1"]:hover {
  background-color: #3f8dfd;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
}

.li-day[isThisMonth="3"] {
  border-radius: 105px;
  color: rgb(255, 255, 255);
  background-color: #3f8dfd;
  font-weight: 600;
}

.title-left {
  display: inline-block;
  width: 4px;
  height: 18px;
  background: repeating-linear-gradient(#3f90fd, #3fb6fd);
  border-radius: 2px;
  margin-right: 10px;
  margin-left: 10px;
 
}
</style>
