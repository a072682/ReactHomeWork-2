import { useState,useEffect,useRef } from "react";
import axios from "axios";
import { Modal } from 'bootstrap';//從BS5中引進Modal元件

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;


//新建產品預設內容
const defaultModalState = {
  imageUrl: "",
  title: "",
  category: "",
  unit: "",
  origin_price: "",
  price: "",
  description: "",
  content: "",
  is_enabled: 0,
  imagesUrl: [""]
};
//新建產品預設內容

function App() {
  //設定是否切換至產品頁面之判斷式
  const [isAuth, setIsAuth] = useState(false);

  //設定初始帳號密碼狀態
  const [account, setAccount] = useState({
    username: "example@test.com",
    password: "example",
  });


  //呼叫useEffect進行初始函數的執行並指執行1次(最後的空矩陣)
  useEffect(() =>
    {
      //從cookie中取得token並放入宣告的token
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/,"$1",);
      
      //由於是一開始就會進行渲染因此token的程式碼要放在前面才能先抓到，登入頁面才有辦法判定是否有登入過
      axios.defaults.headers.common['Authorization'] = token;

      //確認是否有登入的函式
      checkUserLogin();
    },[]
  )

  //產品列表所使用的來源陣列
  const [products, setProducts] = useState([]);

  //取得產品列表的函式
  const getProducts = async () => {
    try {
      //發出取得產品列表的請求並放入getProductsRes
      const getProductsRes = await axios.get(`${BASE_URL}/v2/api/${API_PATH}/admin/products`);

      //如果請求成功則console.log"取得產品資料成功"
      console.log("取得產品資料成功")

      //如果請求成功則由setProducts複寫至Products
      setProducts(getProductsRes.data.products);

    } catch (error) {
      //如果請求失敗則console.log"取得產品失敗"
      console.log("取得產品失敗");
    }
  };

  //確認是否有登入的函式
  const checkUserLogin = async () => {
    try {
      //發起請求確認是否有登入
      await axios.post(`${BASE_URL}/v2/api/user/check`);
      
      //產品列表更新
      getProducts();

      //設定是否切換至產品頁面之判斷式為通過
      setIsAuth(true);
    } catch (error) {
      console.log("登入失敗",error.data);
    }
  };


  //handleInputChange為抓取input的內容並使用setAccount進行覆寫
  const handleInputChange = (e) => {
    //解構value跟name
    const { value, name } = e.target;
    //進行覆寫
    setAccount({
      ...account,
      [name]: value,
    });
  };

  //handleLogin為處理登入時的函式
  const handleLogin = async (e) => {
    //取消預設動作
    e.preventDefault();

    try {
      //發起請求確認是否登入成功
      const res = await axios.post(`${BASE_URL}/v2/admin/signin`, account);

      //解構token和expired
      const { token, expired } = res.data;
      //將token和expired放入cookie
      document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;

      //此行程式碼為每次發送請求時都會帶入token
      axios.defaults.headers.common["Authorization"] = token;

      //產品列表更新
      getProducts();

      //設定是否切換至產品頁面之判斷式為通過
      setIsAuth(true);
    } catch (error) {
      alert("登入失敗");
    }
  };

  //宣告productModalRef(產品編輯頁面)變數並使用useRef抓取相對應的DOM元素
  //初始值為空值
  const productModalRef = useRef(null);

  //宣告productModalRef(刪除產品頁面)變數並使用useRef抓取相對應的DOM元素
  const delProductModalRef = useRef(null);

  //使用useEffect來創建新的Modal元件並初始化並只執行一次
  //建立新的並要初始化的元件都放此處
  useEffect(()=>{
    // console.log(productModalRef.current);

    //建立新Modal元件為productModalRef
    //Ref後方的.current為其取得的元件本身
    //backdrop:false為bs5提供的設定意思是點擊視窗外也不會讓Modal消失
    new Modal(productModalRef.current,{
      backdrop:false
    });

    //建立新Modal元件為delProductModalRef
    new Modal(delProductModalRef.current,{
      backdrop:false
    });

  },[])
  
  //判斷新建產品或是編輯產品的狀態
  const [modalMode,setModalMode] = useState(null);

  //宣告控制開啟Modal元件函式
  //會帶入兩個變數mode和product
  //handleOpenProductModal會帶兩種狀態 1."create" 2."edit"
  const handleOpenProductModal = (mode, product) =>{

    //根據觸發handleOpenProductModal的狀態會被代入setModalMode並更新modalMode
    setModalMode(mode);


    //判斷式對1."create" 2."edit"進行判斷
    switch(mode){
      //如果是"create"則setTempProduct代入新增用初始物件
      case "create": setTempProduct(defaultModalState);
      //跳出程式
      break;

      //如果是"edit"則setTempProduct代入產品列表陣列
      case "edit": setTempProduct(product);
      //跳出程式
      break;
    }

    //宣告modalInstance並將productModalRef的Modal元件給放入
    const modalInstance = Modal.getInstance(productModalRef.current);

    //顯示Modal元件
    modalInstance.show();
  }

  //宣告控制關閉Modal元件函式
  const handleCloseProductModal = ()=>{

    //宣告modalInstance並將productModalRef的Modal元件給放入
    const modalInstance = Modal.getInstance(productModalRef.current);

    //關閉Modal元件
    modalInstance.hide();
  }

  //宣告控制開啟刪除用Modal元件函式
  const handleOpenDelProductModal = (product)=>{

    //產品狀態覆寫
    setTempProduct(product);

    //宣告modalInstance並將delProductModalRef的Modal元件給放入
    const modalInstance = Modal.getInstance(delProductModalRef.current);

    //顯示Modal元件
    modalInstance.show();
  }

  //宣告控制關閉刪除用Modal元件函式
  const handleCloseDelProductModal = ()=>{

    //宣告modalInstance並將delProductModalRef的Modal元件給放入
    const modalInstance = Modal.getInstance(delProductModalRef.current);

    //關閉Modal元件
    modalInstance.hide();
  }

  //建立或編輯的物件函數
  //初始狀態為新建產品的初始物件
  const [tempProduct, setTempProduct] = useState(defaultModalState);
  //建立或編輯的物件函數

  //建立新產品時控制資料變動時的函式
  const handleModalInputChange = (event)=>{
    //對目標進行解構
    const {value,name,checked,type} = event.target;

    //對新增用初始物件進行覆寫
    setTempProduct({
      ...tempProduct,
      //如果type等於"checkbox"則輸出checked的結果(tempProduct.is_enabled即0或1)如果不等於則輸出value的內容
      [name]: type === "checkbox" ? checked : value
    })
  }

  //控制改變副圖內容的函式
  //引入兩個函數(目標，序列)
  const handleImageChange = ((event,index)=>{

    //解構法將目標的內容取出(value)
    const{value} = event.target;

    //創建新陣列並將原本的副圖陣列放入
    const newImages = [...tempProduct.imagesUrl];

    //在新陣列後方使用序列函數讓圖片內容可以新增到圖片陣列中的當前圖片
    //為何要創建新陣列?單純將目標的value放入tempProduct.imagesUrl的話會導致系統不知道要更新哪個圖片所以需要序列(index)幫忙指引
    newImages[index] = value;

    //寫入產品
    setTempProduct(
      {
        ...tempProduct,
        imagesUrl:newImages
      }
    )
  })

  //控制新增副圖內容的函式
  const handleAddImage = () =>{
    // 在複製的陣列末尾新增一個空字串（""），表示新增一個新的圖片輸入框。
    // 假設 tempProduct.imagesUrl 為：tempProduct.imagesUrl = ["url1", "url2"];經過這行程式碼執行後為:const newImages = ["url1", "url2", ""];
    const newImages = [...tempProduct.imagesUrl,""];

    //寫入產品
    setTempProduct({
      ...tempProduct,
      imagesUrl:newImages
    })
  }

  //控制刪除副圖內容的函式
  const handleRemoveImage = () =>{
    //複製陣列至newImages
    const newImages = [...tempProduct.imagesUrl];
    //刪除newImages陣列的最後一筆資料
    newImages.pop();
    //寫入產品
    setTempProduct({
      ...tempProduct,
      imagesUrl:newImages
    })
  }

  //控制新增產品的函式
  const createProduct = async() =>{
    try{
      //發出新增產品的請求
      const createProductRef = await axios.post(`${BASE_URL}/v2/api/${API_PATH}/admin/product`,{
        data:{
          ...tempProduct,
          //並將需要數據為數字型的的數據進行轉換
          origin_price:Number(tempProduct.origin_price),
          //並將需要數據為數字型的的數據進行轉換
          price:Number(tempProduct.price),
          //將true和false型態的數據進行轉換
          is_enabled: tempProduct.is_enabled ? (1) : (0)
        }
      })
      console.log("新增產品成功",createProductRef);
    }catch(error){
      console.log("產品新增失敗");
    }
  }

  //判斷處理產品的函式
  const handleUpdateProduct = async() => {
    //對新建產品和更新產品進行判斷
    const apiCall = modalMode === "create" ? (createProduct) : (updataProduct);

    try{
      //判斷後進行執行(執行createProduct 或 updataProduct)
      await apiCall();

      //產品列表更新
      getProducts();
      
      //關閉Modal
      handleCloseProductModal();
    }catch(error){
      console.log("更新新增失敗");
    }
  }

  //更新(編輯)產品函式
  const updataProduct = async() =>{
    try{
      //發起更新(編輯)產品請求
      const createProductRef = await axios.put(`${BASE_URL}/v2/api/${API_PATH}/admin/product/${tempProduct.id}`,{
        data:{
          ...tempProduct,
          origin_price:Number(tempProduct.origin_price),
          price:Number(tempProduct.price),
          is_enabled: tempProduct.is_enabled ? (1) : (0)
        }
      })
      console.log("新增產品成功",createProductRef);
    }catch(error){
      console.log("產品新增失敗");
    }
  }

  //刪除產品函式
  const deletelProduct = async() =>{
    try{
      //發起刪除產品請求
      const createProductRef = await axios.delete(`${BASE_URL}/v2/api/${API_PATH}/admin/product/${tempProduct.id}`)
      console.log("刪除產品成功",createProductRef);
    }catch(error){
      console.log("刪除新增失敗");
    }
  }

  //判斷刪除產品函式
  const handledeletelProduct = async()=>{
    try{
      //刪除產品函式
      await deletelProduct()

      //產品列表更新
      getProducts();

      //關閉刪除用Modal
      handleCloseDelProductModal();
    }catch(error){
      console.log("產品刪除失敗");
    }
  }
  

  return (
    <>
      {isAuth ? 
        (//產品頁面區塊
          <div className="container py-5">
            <div className="row">
              <div className="col">
                <div className="d-flex justify-content-between">
                  <h2>產品列表</h2>
                  <button onClick={()=>{handleOpenProductModal("create")}} type="button" className="btn btn-primary">建立新的產品</button>
                </div>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">產品名稱</th>
                      <th scope="col">原價</th>
                      <th scope="col">售價</th>
                      <th scope="col">是否啟用</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <th scope="row">{product.title}</th>
                        <td>{product.origin_price}</td>
                        <td>{product.price}</td>
                        <td>{product.is_enabled ? (<span className="text-success">啟用</span>):(<span>未啟用</span>)}</td>
                        <td className="text-end">
                          <div className="btn-group">
                            <button onClick={()=>{handleOpenProductModal("edit", product)}} type="button" className="btn btn-outline-primary btn-sm">編輯</button>
                            <button onClick={()=>{handleOpenDelProductModal(product)}} type="button" className="btn btn-outline-danger btn-sm">刪除</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )//產品頁面區塊
      : 
        (//登入頁面區塊
          <div className="d-flex flex-column justify-content-center align-items-center vh-100">
            <h1 className="mb-5">請先登入</h1>
            <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
              <div className="form-floating mb-3">
                <input
                  name="username"
                  value={account.username}
                  onChange={handleInputChange}
                  type="email"
                  className="form-control"
                  id="username"
                  placeholder="name@example.com"
                />
                <label htmlFor="username">Email address</label>
              </div>
              <div className="form-floating">
                <input
                  name="password"
                  value={account.password}
                  onChange={handleInputChange}
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Password"
                />
                <label htmlFor="password">Password</label>
              </div>
              <button className="btn btn-primary">登入</button>
            </form>
            <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
          </div>
        )//登入頁面區塊
      }

      {/* Modal頁面(編輯資料頁面) */}
      <div ref={productModalRef} id="productModal" className="modal" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        {/* ref為useRef抓取DOM元素的方法 */}
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-bottom">
              <h5 className="modal-title fs-4">{modalMode === "create" ? "新增產品" : "編輯產品"}</h5>
              <button onClick={handleCloseProductModal} type="button" className="btn-close" aria-label="Close"></button>
            </div>

            <div className="modal-body p-4">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="mb-4">
                    <label htmlFor="primary-image" className="form-label">
                      主圖
                    </label>
                    <div className="input-group">
                      <input
                        value={tempProduct.imageUrl}
                        onChange={handleModalInputChange}
                        name="imageUrl"
                        type="text"
                        id="primary-image"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                      />
                    </div>
                    <img
                      src={tempProduct.imageUrl}
                      alt={tempProduct.title}
                      className="img-fluid"
                    />
                  </div>

                  {/* 副圖 */}
                  <div className="border border-2 border-dashed rounded-3 p-3">
                    {tempProduct.imagesUrl?.map((image, index) => (
                      <div key={index} className="mb-2">
                        <label
                          htmlFor={`imagesUrl-${index + 1}`}
                          className="form-label"
                        >
                          副圖 {index + 1}
                        </label>
                        <input
                          value={image}
                          onChange={(e)=>{handleImageChange(e,index)}}
                          id={`imagesUrl-${index + 1}`}
                          type="text"
                          placeholder={`圖片網址 ${index + 1}`}
                          className="form-control mb-2"
                        />
                        {image && (
                          <img
                            src={image}
                            alt={`副圖 ${index + 1}`}
                            className="img-fluid mb-2"
                          />
                        )}
                      </div>
                    ))}
                    
                    <div className="btn-group w-100">
                      {/* 條件:圖片數量上限為5張(0~4)且(&&)最後一筆資料(tempProduct.imagesUrl[tempProduct.imagesUrl.length -1 ])不等於(!==)空字串("")*/}
                      {/* &&如果前面的條件為 true則渲染後面的內容。false則表達式不會渲染按鈕。 */}
                      {tempProduct.imagesUrl.length < 5 && tempProduct.imagesUrl[tempProduct.imagesUrl.length -1 ] !== "" && 
                        (
                          <button onClick={handleAddImage} className="btn btn-outline-primary btn-sm w-100">新增圖片</button>
                        )
                      }
                      {/* 條件:圖片數量大於1張*/}
                      {/* &&如果前面的條件為 true則渲染後面的內容。false則表達式不會渲染按鈕。 */}
                      {tempProduct.imagesUrl.length > 1 && 
                         (
                          <button onClick={handleRemoveImage} className="btn btn-outline-danger btn-sm w-100">取消圖片</button>
                         )
                      }
                    </div>

                  </div>
                </div>

                <div className="col-md-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      標題
                    </label>
                    <input
                      value={tempProduct.title}
                      onChange={handleModalInputChange}
                      name="title"
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">
                      分類
                    </label>
                    <input
                      value={tempProduct.category}
                      onChange={handleModalInputChange}
                      name="category"
                      id="category"
                      type="text"
                      className="form-control"
                      placeholder="請輸入分類"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="unit" className="form-label">
                      單位
                    </label>
                    <input
                      value={tempProduct.unit}
                      onChange={handleModalInputChange}
                      name="unit"
                      id="unit"
                      type="text"
                      className="form-control"
                      placeholder="請輸入單位"
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                        value={tempProduct.origin_price}
                        onChange={handleModalInputChange}
                        name="origin_price"
                        id="origin_price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入原價"
                      />
                    </div>
                    <div className="col-6">
                      <label htmlFor="price" className="form-label">
                        售價
                      </label>
                      <input
                        value={tempProduct.price}
                        onChange={handleModalInputChange}
                        name="price"
                        id="price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入售價"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                      value={tempProduct.description}
                      onChange={handleModalInputChange}
                      name="description"
                      id="description"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入產品描述"
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                      value={tempProduct.content}
                      onChange={handleModalInputChange}
                      name="content"
                      id="content"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入說明內容"
                    ></textarea>
                  </div>

                  <div className="form-check">
                    <input
                      checked={tempProduct.is_enabled}
                      onChange={handleModalInputChange}
                      name="is_enabled"
                      type="checkbox"
                      className="form-check-input"
                      id="isEnabled"
                    />
                    <label className="form-check-label" htmlFor="isEnabled">
                      是否啟用
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top bg-light">
              <button onClick={handleCloseProductModal} type="button" className="btn btn-secondary">
                取消
              </button>
              <button onClick={handleUpdateProduct} type="button" className="btn btn-primary">
                確認
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal頁面(編輯資料頁面) */}
      
      {/* 刪除頁面區塊 */}
      <div
        ref={delProductModalRef}
        className="modal fade"
        id="delProductModal"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">刪除產品</h1>
              <button
                onClick={handleCloseDelProductModal}
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              你是否要刪除 
              <span className="text-danger fw-bold">{tempProduct.title}</span>
            </div>
            <div className="modal-footer">
              <button
                onClick={handleCloseDelProductModal}
                type="button"
                className="btn btn-secondary"
              >
                取消
              </button>
              <button onClick={handledeletelProduct} type="button" className="btn btn-danger">
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* 刪除頁面區塊 */}
    </>
  );
}

export default App;