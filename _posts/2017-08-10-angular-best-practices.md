---
layout: post
title: 'Angular 最佳实践'
tags: [code]
---


从去年十月份开始接触 Angular 到现在，已经有大半年的时间了，同时也见证了 Angular 的快速发展，其版本也从 Angular 2 跃升为 Angular 4。与 React、Vue 相比，Angular 框架更加严谨而全面，这使得它非常适合构建大型 Web App。然而也是因为这一点，使其学习曲线陡峭，让很多初学者望而止步。

本文将以官网的 Heroes 为背景，介绍在创建一个 Angular 应用中所使用的一些最佳实践。


## 一、核心概念

Angular 中最重要的三个概念是：模块、服务和组件：

* 模块：用于打包发布组件和服务
* 服务：用于添加应用逻辑
* 组件：用于管理 HTML 模板

模块是一个带有 `@NgModule` 装饰器的类。每一个 Angular 应用都有一个根模块（AppModule），根据应用规模，可能还有核心模块（CoreModule）、共享模块（SharedModule）和一些特性模块（Feature Module）。

```ts
// import modules, components, services here

@NgModule({
  imports: [CommonModule, RouterModule, FormsModule],
  exports: [NavigateComponent],
  providers: [AuthorizationService, AuthorizationGuard],
  declarations: [NavigateComponent, LoginComponent, NotFoundComponent]
})
export class CoreModule { }
```

上面的代码表示核心模块 CoreModule 需要：

* 导入 Angular 的路由模块、表单模块
* 导出了内部的 NavigateComponent 组件
* 提供 AuthorizationService 服务
* 声明 NavigateComponent、LoginComponent 等组件属于该模块

CoreModule 只能在应用启动时被 AppModule 一次性导入，所以它所提供的服务都是单例的。

服务是指用来封装按特性划分的可复用变量和函数的一个类，例如日志服务、数据服务、应用程序配置服务等。

组件是具有视图的类，它通过数据绑定的方式来负责渲染视图以及处理交互事件。设计良好的组件只负责提供用户体验的部分，其他的琐事（如从服务器获取数据、数据校验）都交给服务来做。


## 二、目录结构

Angular 官方提供一个 CLI 工具来生成、运行、测试和打包 Angular 项目。下面是一个经过实践的 Angular 项目的目录和文件结构组织方式：

```
src/app
├── core
│   ├── authorization
│   │   ├── authorization-guard.service.spec.ts
│   │   ├── authorization-guard.service.ts
│   │   ├── authorization.service.spec.ts
│   │   └── authorization.service.ts
│   ├── login
│   │   ├── login.component.css
│   │   ├── login.component.html
│   │   ├── login.component.spec.ts
│   │   └── login.component.ts
│   ├── navigate
│   │   ├── navigate.component.css
│   │   ├── navigate.component.html
│   │   ├── navigate.component.spec.ts
│   │   └── navigate.component.ts
│   ├── not-found
│   │   ├── not-found.component.css
│   │   ├── not-found.component.html
│   │   ├── not-found.component.spec.ts
│   │   └── not-found.component.ts
│   └── core.module.ts
├── heroes
│   ├── hero-detail
│   │   ├── hero-detail.component.css
│   │   ├── hero-detail.component.html
│   │   ├── hero-detail.component.spec.ts
│   │   └── hero-detail.component.ts
│   ├── hero-list
│   │   ├── hero-list.component.css
│   │   ├── hero-list.component.html
│   │   ├── hero-list.component.spec.ts
│   │   └── hero-list.component.ts
│   ├── shared
│   │   ├── hero.model.ts
│   │   ├── hero.service.spec.ts
│   │   └── hero.service.ts
│   ├── heroes-routing.module.ts
│   ├── heroes.component.spec.ts
│   ├── heroes.component.ts
│   └── heroes.module.ts
├── shared
│   └── shared.module.ts
├── animations.ts
├── app-routing.module.ts
├── app.component.css
├── app.component.html
├── app.component.spec.ts
├── app.component.ts
└── app.module.ts
```

需要在项目中创建模块、服务或组件时，推荐使用 `ng generate` 命令。比如要创建一个 HeroDetailComponent，则可以在命令行中输入：

```sh
ng generate component hero-detail
```

## 三、路由及异步路由

在 Angular 应用中，用于配置路由信息的文件应该和其所属的模块在一起，通常有 `-routing.module.ts` 后缀。例如下面的 `heroes-routing.module.ts` 用于配置 HeroesModule 的路由信息：

```ts
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', component: HeroListComponent },
  { path: ':id', component: HeroDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HeroesRoutingModule { }
```

当 Angular 应用变大之后，一次性加载所有的特性模块会导致用户访问时需要更长的时间，因此我们希望某些特性模块只在用户请求的时候才进行加载。这时我们需要配置异步路由来实现特性模块的惰性加载。

```ts
const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'hero', loadChildren: './heroes/heroes.module#HeroesModule' },
  { path: '**', component: NotFoundComponent },
];
```

有时候，应用需要路由守卫（Guard）来限制非授权用户访问某些目标组件或者在离开组件时询问是否保存修改。

## 四、测试

Angular 适合使用 Test Driven Develop 的方式进行软件开发。在使用 @angular/cli 创建的模块、服务和组件中，均会有与之同名的 `.spec.ts` 文件，测试代码写在这些文件里即可。比如下面的代码用于测试 NavigateComponent 是否显示正确的登录或注销按钮。

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
import { RouterTestingModule } from '@angular/router/testing';

TestBed.configureTestingModule({
  imports: [RouterTestingModule],
  declarations: [AppComponent],
});
```