//获取应用实例
const app = getApp()

Page({
  data: {
    articleList: [], // 文章列表数据 
    name: '', // 搜索(申请编号)
    type: ''
  },
  onActionButtonTap: function(event) {
    // 使用箭头函数确保作用域正确 
    const id = event.currentTarget.dataset.id; // 获取传递的 id 参数
    // 执行跳转逻辑，并传递参数
    if(this.data.type == '1'){
      wx.navigateTo({
        url: '../fitness_room/fitness_room_index?id=' + id+'&type='+this.data.type, // 替换为实际的页面路径和参数名
      });
    }else{
    wx.navigateTo({
      url: '../all/enroll_all?id=' + id+'&type='+this.data.type, // 替换为实际的页面路径和参数名
    });
    }
  },
  onLoad: function(options) {
    // 页面加载完成时执行的代码
    this.setData({
      type: options.id,
    });   
    this.onSearch();
  },
  onShow: function () {
     
  },

  // 输入框内容改变时触发
  onInput(e) {
    this.setData({
      name: e.detail.value
    });
  },

  // 点击搜索按钮触发
  onSearch() { 
    // 根据关键字构造文章列表
    this.setData({ isLoad: false }); 
    this.constructArticleList(); 
  },

  // 分页查询，滑动到底部时触发
  onScrollToLower:function() {
    this.constructArticleList();
  },

  // 构造文章列表
  constructArticleList() {
    const { type, name,articleList} = this.data;

    // 发送请求到后端进行数据查询
    wx.request({
      url: app.globalData.apiPath+'/xcx/basic/project/list',
      data: {
        type: type,
        name: name
      },
      success: (res) => {
        const newArticleList = res.data.body; // 假设后端返回的数据为文章列表 
        // 将新的文章数据追加到列表末尾
        if(newArticleList!=null) {
          this.setData({
            articleList: newArticleList, 
          });
        }
        this.setData({ isLoad: true });
        console.log("this.getdata",this.data.articleList);
      },
      fail: (err) => {
        this.setData({ isLoad: true }); 
      }
    });
  }
});
