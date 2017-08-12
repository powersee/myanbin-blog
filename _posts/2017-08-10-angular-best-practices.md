---
layout: post
title: 'Angular 最佳实践'
tags: [code]
---

从去年十月份开始接触 Angular 到现在，已经有大半年的时间了，其版本也从 Angular 2 跃升为 Angular 4。

与 React、Vue 相比，Angular 框架更加严谨而全面，这使得它非常适合构建大型 Web App。然而也是因为这一点，使其学习曲线陡峭，让很多初学者望而止步。

本文将以官网的 Heroes 为背景，介绍在创建一个 Angular 应用中所使用的一些最佳实践。


## 一、核心概念

Angular 中最重要的三个概念是：模块、服务和组件：

* 模块：用于打包发布组件和服务
* 服务：用于添加应用逻辑
* 组件：用于管理 HTML 模板

模块是一个带有 `@NgModule` 装饰器的类，每一个 Angular 应用都有一个根模块（AppModule），根据应用规模，可能还有核心模块（CoreModule）、共享模块（SharedModule）和一些特性模块（Feature Module）。

服务是指用来封装按特性划分的可复用变量和函数的一个类，例如日志服务、数据服务、应用程序配置服务等。

组件是具有视图的类，它通过数据绑定的方式来负责渲染视图以及处理交互事件。设计良好的组件只负责提供用户体验的部分，其他的琐事（如从服务器获取数据、数据校验）都交给服务来做。


## 二、目录结构

Angular 官方提供一个 CLI 工具来生成、运行、测试和打包 Angular 项目。

## 三、路由及异步路由

当 Angular 应用变大之后，一次性加载所有的特性模块会导致用户访问时需要更长的时间，因此我们希望某些特性模块只在用户请求的时候才进行加载。这时我们需要配置异步路由来实现特性模块的惰性加载。

```ts
const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'hero', loadChildren: './heroes/heroes.module#HeroesModule', canLoad: [AuthorizationGuard] },
  { path: '**', component: NotFoundComponent },
];
```

## 四、测试

Angular 适合使用 Test Driven Develop 的方式进行软件开发。在使用 @angular/cli 创建的组件、服务中，均会有与之同名的 `.spec.ts` 文件，测试代码写在这些文件里即可。比如下面的代码用于测试 Navigate 组件是否显示正确的登录或注销按钮。

```ts
describe('NavigateComponent', () => {
  it('should display logout', () => {
    let compiled = fixture.debugElement.nativeElement;
    authorizationService.isLoggedIn = true;
    fixture.detectChanges();
    expect(compiled.querySelector('.nav-end').textContent).toContain('注销');
  });

  it('should display logoin', () => {
    let compiled = fixture.debugElement.nativeElement;
    authorizationService.isLoggedIn = false;
    fixture.detectChanges();
    expect(compiled.querySelector('.nav-end').textContent).toContain('登录');
  });
};
```

在对有路由模块的组件进行测试时，需要导入 RouterTestingModule：

```ts
<!-- app.component.spec.ts -->
import { RouterTestingModule } from '@angular/router/testing';

TestBed.configureTestingModule({
  imports: [RouterTestingModule],
  declarations: [AppComponent],
});
```